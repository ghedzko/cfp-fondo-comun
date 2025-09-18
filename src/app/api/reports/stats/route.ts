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

    // Get general statistics
    const [
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalContributions,
      totalInvoices,
      activeCoursePeriods,
      recentContributions
    ] = await Promise.all([
      // Total students
      db.student.count(),
      
      // Total courses
      db.course.count(),
      
      // Total enrollments
      db.enrollment.count(),
      
      // Total contributions with sum
      db.contribution.aggregate({
        _sum: { amount: true },
        _count: true
      }),
      
      // Total invoices
      db.courseInvoice.count(),
      
      // Active course periods (current year)
      db.coursePeriod.count({
        where: {
          year: new Date().getFullYear()
        }
      }),
      
      // Recent contributions (last 30 days)
      db.contribution.findMany({
        where: {
          paymentDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          student: true,
          coursePeriod: {
            include: {
              course: true
            }
          }
        },
        orderBy: {
          paymentDate: 'desc'
        },
        take: 10
      })
    ]);

    // Calculate contribution rate
    const contributionRate = totalEnrollments > 0 
      ? Math.round((totalContributions._count / totalEnrollments) * 100) 
      : 0;

    // Get monthly contribution trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await db.contribution.groupBy({
      by: ['month', 'year'],
      where: {
        OR: [
          { year: { gt: sixMonthsAgo.getFullYear() } },
          {
            AND: [
              { year: sixMonthsAgo.getFullYear() },
              { month: { gte: sixMonthsAgo.getMonth() + 1 } }
            ]
          }
        ]
      },
      _sum: {
        amount: true
      },
      _count: true,
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    });

    // Get top contributing courses
    const topCourses = await db.contribution.groupBy({
      by: ['coursePeriodId'],
      _sum: {
        amount: true
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 5
    });

    // Get course details for top courses
    const topCoursesWithDetails = await Promise.all(
      topCourses.map(async (course) => {
        const coursePeriod = await db.coursePeriod.findUnique({
          where: { id: course.coursePeriodId },
          include: {
            course: true
          }
        });
        return {
          ...course,
          coursePeriod
        };
      })
    );

    const stats = {
      overview: {
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalContributions: totalContributions._count,
        totalAmount: totalContributions._sum.amount || 0,
        totalInvoices,
        activeCoursePeriods,
        contributionRate
      },
      trends: {
        monthly: monthlyTrends.map(trend => ({
          month: trend.month,
          year: trend.year,
          amount: trend._sum.amount || 0,
          count: trend._count,
          label: `${trend.month}/${trend.year}`
        }))
      },
      topCourses: topCoursesWithDetails.map(course => ({
        coursePeriodId: course.coursePeriodId,
        courseName: course.coursePeriod?.course.name || 'Unknown',
        periodName: course.coursePeriod?.name || 'Unknown',
        totalAmount: course._sum.amount || 0,
        contributionCount: course._count
      })),
      recentActivity: recentContributions.map(contribution => ({
        id: contribution.id,
        studentName: `${contribution.student.firstName} ${contribution.student.lastName}`,
        courseName: contribution.coursePeriod.course.name,
        amount: contribution.amount,
        month: contribution.month,
        year: contribution.year,
        paymentDate: contribution.paymentDate
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
