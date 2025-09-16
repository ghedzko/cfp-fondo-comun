import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for course period creation/update
const CoursePeriodSchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  monthlyPrice: z.number().positive('Precio debe ser mayor a 0'),
  enabledMonths: z.array(z.number().min(1).max(12)).min(1, 'Debe seleccionar al menos un mes'),
});

// GET /api/cursos/[id]/periodos - Get periods for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const periods = await db.coursePeriod.findMany({
      where: { courseId: id },
      orderBy: { startDate: 'desc' },
      include: {
        course: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json({ periods });
  } catch (error) {
    console.error('Error fetching course periods:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/cursos/[id]/periodos - Create new course period
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const validatedData = CoursePeriodSchema.parse(body);

    // Verify course exists
    const course = await db.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Validate date range
    if (validatedData.startDate >= validatedData.endDate) {
      return NextResponse.json(
        { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
        { status: 400 }
      );
    }

    // Create course period
    const period = await db.coursePeriod.create({
      data: {
        courseId: id,
        name: validatedData.name,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        monthlyPrice: validatedData.monthlyPrice,
        enabledMonths: validatedData.enabledMonths || [3, 4, 5, 6],
        year: validatedData.startDate.getFullYear(),
      },
      include: {
        course: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json(period, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating course period:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
