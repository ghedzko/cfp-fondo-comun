import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { optimizedQueries, withPerformanceMonitoring } from '@/lib/prisma-optimized';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get optimized statistics with performance monitoring
    const getStatsOptimized = withPerformanceMonitoring(
      'reports-stats-api',
      async () => {
        // Use optimized queries for better performance
        const [dashboardStats, monthlyTrends, topCourses] = await Promise.all([
          optimizedQueries.getDashboardStats(),
          optimizedQueries.getMonthlyTrends(6),
          optimizedQueries.getTopCourses(5)
        ]);

        // Get recent contributions (last 30 days)
        const recentContributions = await db.contribution.findMany({
          where: {
            paymentDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                dni: true
              }
            },
            coursePeriod: {
              select: {
                id: true,
                name: true,
                course: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            paymentDate: 'desc'
          },
          take: 10
        });

        // Get total invoices count
        const totalInvoices = await db.courseInvoice.count();

        // Calculate contribution rate
        const contributionRate = dashboardStats.totalEnrollments > 0 
          ? Math.round((dashboardStats.totalContributions / dashboardStats.totalEnrollments) * 100) 
          : 0;

        return {
          overview: {
            totalStudents: dashboardStats.totalStudents,
            totalCourses: dashboardStats.totalCourses,
            totalEnrollments: dashboardStats.totalEnrollments,
            totalContributions: dashboardStats.totalContributions,
            totalAmount: dashboardStats.totalAmount,
            totalInvoices,
            activeCoursePeriods: dashboardStats.activeCoursePeriods,
            contributionRate
          },
          trends: {
            monthly: monthlyTrends
          },
          topCourses,
          recentActivity: recentContributions.map(contribution => ({
            id: contribution.id,
            studentName: `${contribution.student.firstName} ${contribution.student.lastName}`,
            courseName: contribution.coursePeriod.course.name,
            amount: Number(contribution.amount),
            month: contribution.month,
            year: contribution.year,
            paymentDate: contribution.paymentDate
          }))
        };
      }
    );

    const stats = await getStatsOptimized();
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
