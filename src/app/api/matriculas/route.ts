import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/matriculas - Get all enrollments with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ACTIVE';
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (courseId) {
      where.coursePeriod = {
        courseId: courseId
      };
    }
    
    if (search) {
      where.OR = [
        {
          student: {
            firstName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          student: {
            lastName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          student: {
            dni: {
              contains: search
            }
          }
        },
        {
          coursePeriod: {
            course: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        }
      ];
    }

    // Get enrollments with pagination
    const [enrollments, totalCount] = await Promise.all([
      db.enrollment.findMany({
        where,
        include: {
          student: true,
          coursePeriod: {
            include: {
              course: true,
            },
          },
        },
        orderBy: [
          { enrollmentDate: 'desc' },
          { student: { lastName: 'asc' } },
          { student: { firstName: 'asc' } },
        ],
        skip: offset,
        take: limit,
      }),
      db.enrollment.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      enrollments,
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
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
