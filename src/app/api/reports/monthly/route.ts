import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Build where clause
    const where: any = {};
    
    if (courseId) {
      where.coursePeriod = {
        courseId: parseInt(courseId)
      };
    }
    
    if (month) {
      where.month = parseInt(month);
    }
    
    if (year) {
      where.year = parseInt(year);
    }

    // Get contributions with related data
    const contributions = await db.contribution.findMany({
      where,
      include: {
        student: true,
        coursePeriod: {
          include: {
            course: true,
            enrollments: {
              include: {
                student: true
              }
            }
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { paymentDate: 'desc' }
      ]
    });

    // Group by course period
    const reportsByCoursePeriod = contributions.reduce((acc, contribution) => {
      const key = `${contribution.coursePeriodId}`;
      
      if (!acc[key]) {
        acc[key] = {
          coursePeriod: contribution.coursePeriod,
          contributions: [],
          summary: {
            totalAmount: 0,
            contributionCount: 0,
            enrollmentCount: contribution.coursePeriod.enrollments.length,
            contributionRate: 0,
            averageAmount: 0
          }
        };
      }
      
      acc[key].contributions.push(contribution);
      acc[key].summary.totalAmount += Number(contribution.amount);
      acc[key].summary.contributionCount++;
      
      return acc;
    }, {} as any);

    // Calculate rates and averages
    Object.values(reportsByCoursePeriod).forEach((report: any) => {
      const { summary } = report;
      summary.contributionRate = summary.enrollmentCount > 0 
        ? Math.round((summary.contributionCount / summary.enrollmentCount) * 100)
        : 0;
      summary.averageAmount = summary.contributionCount > 0
        ? Math.round(summary.totalAmount / summary.contributionCount)
        : 0;
    });

    // Get available courses for filter
    const availableCourses = await db.course.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // Get course periods count separately
    const coursePeriodsCount = await Promise.all(
      availableCourses.map(async (course) => {
        const count = await db.coursePeriod.count({
          where: {
            courseId: course.id,
            year: year ? parseInt(year) : new Date().getFullYear()
          }
        });
        return { courseId: course.id, count };
      })
    );

    // Get available months/years
    const availablePeriods = await db.contribution.groupBy({
      by: ['month', 'year'],
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const report = {
      filters: {
        courseId: courseId ? parseInt(courseId) : null,
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null,
        monthName: month ? monthNames[parseInt(month) - 1] : null
      },
      data: Object.values(reportsByCoursePeriod),
      metadata: {
        availableCourses: availableCourses.map(course => {
          const periodCount = coursePeriodsCount.find(c => c.courseId === course.id)?.count || 0;
          return {
            id: course.id,
            name: course.name,
            periodsCount: periodCount
          };
        }),
        availablePeriods: availablePeriods.map(period => ({
          month: period.month,
          year: period.year,
          label: `${monthNames[period.month - 1]} ${period.year}`
        }))
      },
      summary: {
        totalCourses: Object.keys(reportsByCoursePeriod).length,
        totalContributions: contributions.length,
        totalAmount: contributions.reduce((sum, c) => sum + Number(c.amount), 0),
        averageContribution: contributions.length > 0 
          ? Math.round(contributions.reduce((sum, c) => sum + Number(c.amount), 0) / contributions.length)
          : 0
      }
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly report' },
      { status: 500 }
    );
  }
}
