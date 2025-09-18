import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/cursos/[id]/periodos/[periodoId] - Get specific course period
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; periodoId: string }> }
) {
  try {
    const { id, periodoId } = await params;
    
    const coursePeriod = await db.coursePeriod.findUnique({
      where: { 
        id: periodoId,
        courseId: id // Ensure the period belongs to the course
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            contributions: true,
          },
        },
      },
    });

    if (!coursePeriod) {
      return NextResponse.json(
        { error: 'Período de curso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(coursePeriod);
  } catch (error) {
    console.error('Error fetching course period:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
