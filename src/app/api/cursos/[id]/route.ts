import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
