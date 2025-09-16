import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for student update
const EstudianteUpdateSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').optional(),
  apellido: z.string().min(2, 'Apellido debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fechaNacimiento: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  isActive: z.boolean().optional(),
});

// GET /api/estudiantes/[id] - Get student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const estudiante = await db.estudiante.findUnique({
      where: { id },
      include: {
        matriculas: {
          include: {
            cursoPeriodo: {
              include: {
                curso: true,
              },
            },
          },
          orderBy: { fechaMatricula: 'desc' },
        },
        aportes: {
          orderBy: { fechaPago: 'desc' },
          take: 10, // Last 10 payments
        },
        _count: {
          select: {
            aportes: true,
          },
        },
      },
    });

    if (!estudiante) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(estudiante);
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
    const validatedData = EstudianteUpdateSchema.parse(body);
    const { id } = await params;

    // Convert empty email to null
    const emailValue = validatedData.email === '' ? null : validatedData.email;

    const estudiante = await db.estudiante.update({
      where: { id },
      data: {
        ...validatedData,
        email: emailValue,
      },
      include: {
        matriculas: {
          include: {
            cursoPeriodo: {
              include: {
                curso: true,
              },
            },
          },
        },
        _count: {
          select: {
            aportes: true,
          },
        },
      },
    });

    return NextResponse.json(estudiante);
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
    const estudiante = await db.estudiante.update({
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
