import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';

// GET /api/cursos - List all active courses with their periods
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const courses = await db.course.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        periods: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
        },
        _count: {
          select: {
            periods: true,
          },
        },
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Validation schema for creating courses
const createCourseSchema = z.object({
  areaCode: z.string().min(1, 'Código de área requerido'),
  profileCode: z.string().min(1, 'Código de perfil requerido'),
  name: z.string().min(1, 'Nombre del curso requerido'),
  duration: z.number().min(1, 'Duración debe ser mayor a 0'),
  requirements: z.string().optional(),
  certificateLevel: z.string().optional(),
  certification: z.string().optional(),
  price: z.number().min(0, 'Precio debe ser mayor o igual a 0'),
  description: z.string().nullable().optional(),
});

// POST /api/cursos - Create a new course
export async function POST(request: NextRequest) {
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
        { error: 'Acceso denegado. Solo administradores pueden crear cursos.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    // Check if course with same area and profile code already exists
    const existingCourse = await db.course.findFirst({
      where: {
        areaCode: validatedData.areaCode,
        profileCode: validatedData.profileCode,
      },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Ya existe un curso con este código de área y perfil' },
        { status: 400 }
      );
    }

    // Create the course
    const course = await db.course.create({
      data: {
        areaCode: validatedData.areaCode,
        profileCode: validatedData.profileCode,
        name: validatedData.name,
        duration: validatedData.duration,
        requirements: validatedData.requirements,
        certificateLevel: validatedData.certificateLevel,
        certification: validatedData.certification,
        price: validatedData.price,
        description: validatedData.description,
        isActive: true,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
