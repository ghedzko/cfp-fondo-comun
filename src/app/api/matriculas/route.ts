import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/matriculas - Get active course periods (cursadas)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'ACTIVE'; // ACTIVE, ALL, UPCOMING, FINISHED
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build where clause for course periods
    const where: any = {};
    
    if (courseId) {
      where.courseId = courseId;
    }
    
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          course: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Filter by period status based on dates
    const now = new Date();
    if (status === 'ACTIVE') {
      where.AND = [
        { startDate: { lte: now } },
        { endDate: { gte: now } }
      ];
    } else if (status === 'UPCOMING') {
      where.startDate = { gt: now };
    } else if (status === 'FINISHED') {
      where.endDate = { lt: now };
    }
    // If status === 'ALL', no date filtering

    // Get course periods with enrollment count
    const [coursePeriods, totalCount] = await Promise.all([
      db.coursePeriod.findMany({
        where,
        include: {
          course: true,
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: [
          { startDate: 'desc' },
          { course: { name: 'asc' } },
          { name: 'asc' }
        ],
        skip: offset,
        take: limit,
      }),
      db.coursePeriod.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      coursePeriods,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error('Error fetching course periods:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
