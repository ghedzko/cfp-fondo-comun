import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/cursos/[id] - Get single course with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const curso = await db.curso.findUnique({
      where: { id },
      include: {
        periodos: {
          where: { isActive: true },
          orderBy: { fechaInicio: 'desc' },
          include: {
            _count: {
              select: {
                matriculas: true,
              },
            },
          },
        },
        _count: {
          select: {
            periodos: true,
          },
        },
      },
    });

    if (!curso) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(curso);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
