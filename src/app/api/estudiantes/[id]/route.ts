import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for student update
const StudentUpdateSchema = z.object({
  firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').optional(),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  isActive: z.boolean().optional(),
});

// GET /api/estudiantes/[id] - Get student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await db.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            coursePeriod: {
              include: {
                course: true,
              },
            },
          },
          orderBy: { enrollmentDate: 'desc' },
        },
        contributions: {
          orderBy: { paymentDate: 'desc' },
          take: 10, // Last 10 payments
        },
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/estudiantes/[id] - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const validatedData = StudentUpdateSchema.parse(body);
    const { id } = await params;

    // Convert empty email to null
    const emailValue = validatedData.email === '' ? null : validatedData.email;

    const student = await db.student.update({
      where: { id },
      data: {
        ...validatedData,
        email: emailValue,
      },
      include: {
        enrollments: {
          include: {
            coursePeriod: {
              include: {
                course: true,
              },
            },
          },
        },
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/estudiantes/[id] - Soft delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await db.student.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Estudiante eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
