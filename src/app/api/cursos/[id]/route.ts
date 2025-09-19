import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

// GET /api/cursos/[id] - Get single course with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const course = await db.course.findUnique({
      where: { id },
      include: {
        periods: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
          include: {
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
        _count: {
          select: {
            periods: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Validation schema for updating courses
const updateCourseSchema = z.object({
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// PUT /api/cursos/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    if (!authResult.user || authResult.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden editar cursos.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    // Check if course exists
    const existingCourse = await db.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Update the course
    const updatedCourse = await db.course.update({
      where: { id },
      data: {
        description: validatedData.description,
        isActive: validatedData.isActive,
      },
      include: {
        periods: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
          include: {
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
        _count: {
          select: {
            periods: true,
          },
        },
      },
    });

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
