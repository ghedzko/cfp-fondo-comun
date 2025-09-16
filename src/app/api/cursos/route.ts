import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/cursos - List all active courses with their periods
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const cursos = await db.curso.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { nombre: 'asc' },
      include: {
        periodos: {
          where: { isActive: true },
          orderBy: { fechaInicio: 'desc' },
        },
        _count: {
          select: {
            periodos: true,
          },
        },
      },
    });

    return NextResponse.json({ cursos });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
