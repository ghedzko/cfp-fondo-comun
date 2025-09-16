import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
