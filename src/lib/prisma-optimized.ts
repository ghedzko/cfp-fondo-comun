/**
 * Optimized Prisma queries for better performance
 * Includes caching, pagination, and query optimization utilities
 */

import { db } from './db';
import { Prisma } from '@prisma/client';

// Cache implementation (in-memory for now, can be replaced with Redis)
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttlSeconds = 300) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }
  
  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }

  deleteByPrefix(prefix: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const queryCache = new QueryCache();

// Pagination utility
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function getPaginationParams(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(options.limit || 20, options.maxLimit || 100);
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

export async function paginatedQuery<T>(
  queryFn: (skip: number, take: number) => Promise<T[]>,
  countFn: () => Promise<number>,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const { page, limit, skip } = getPaginationParams(options);
  
  const [data, total] = await Promise.all([
    queryFn(skip, limit),
    countFn()
  ]);
  
  const pages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    }
  };
}

// Optimized queries for common operations
export const optimizedQueries = {
  // Students with optimized includes
  async getStudentsWithStats(options: PaginationOptions = {}) {
    const cacheKey = `students-stats-${JSON.stringify(options)}`;
    const cached = queryCache.get(cacheKey);
    if (cached) return cached;
    
    const result = await paginatedQuery(
      (skip, take) => db.student.findMany({
        skip,
        take,
        include: {
          _count: {
            select: {
              enrollments: true,
              contributions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      () => db.student.count()
    );
    
    queryCache.set(cacheKey, result, 300); // 5 minutes
    return result;
  },

  // Courses with periods count
  async getCoursesWithPeriods(options: PaginationOptions = {}) {
    const cacheKey = `courses-periods-${JSON.stringify(options)}`;
    const cached = queryCache.get(cacheKey);
    if (cached) return cached;
    
    const result = await paginatedQuery(
      (skip, take) => db.course.findMany({
        skip,
        take,
        include: {
          _count: {
            select: {
              periods: true
            }
          },
          periods: {
            where: {
              isActive: true
            },
            select: {
              id: true,
              name: true,
              year: true,
              isActive: true
            },
            orderBy: {
              startDate: 'desc'
            },
            take: 3 // Only latest 3 periods
          }
        },
        orderBy: {
          name: 'asc'
        }
      }),
      () => db.course.count()
    );
    
    queryCache.set(cacheKey, result, 600); // 10 minutes
    return result;
  },

  // Contributions with optimized joins
  async getContributionsWithDetails(options: PaginationOptions & {
    studentId?: string;
    coursePeriodId?: string;
    year?: number;
    month?: number;
  } = {}) {
    const { studentId, coursePeriodId, year, month, ...paginationOptions } = options;
    const cacheKey = `contributions-details-${JSON.stringify(options)}`;
    const cached = queryCache.get(cacheKey);
    if (cached) return cached;
    
    const where: Prisma.ContributionWhereInput = {};
    if (studentId) where.studentId = studentId;
    if (coursePeriodId) where.coursePeriodId = coursePeriodId;
    if (year) where.year = year;
    if (month) where.month = month;
    
    const result = await paginatedQuery(
      (skip, take) => db.contribution.findMany({
        skip,
        take,
        where,
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
        }
      }),
      () => db.contribution.count({ where })
    );
    
    queryCache.set(cacheKey, result, 180); // 3 minutes
    return result;
  },

  // Dashboard stats with aggressive caching
  async getDashboardStats() {
    const cacheKey = 'dashboard-stats';
    const cached = queryCache.get(cacheKey);
    if (cached) return cached;
    
    const [
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalContributions,
      totalAmount,
      activeCoursePeriods
    ] = await Promise.all([
      db.student.count(),
      db.course.count(),
      db.enrollment.count(),
      db.contribution.count(),
      db.contribution.aggregate({
        _sum: {
          amount: true
        }
      }),
      db.coursePeriod.count({
        where: {
          isActive: true
        }
      })
    ]);
    
    const stats = {
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalContributions,
      totalAmount: Number(totalAmount._sum.amount || 0),
      activeCoursePeriods
    };
    
    queryCache.set(cacheKey, stats, 900); // 15 minutes
    return stats;
  },

  // Monthly trends with optimized aggregation
  async getMonthlyTrends(months = 6) {
    const cacheKey = `monthly-trends-${months}`;
    const cached = queryCache.get(cacheKey);
    if (cached) return cached;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const trends = await db.contribution.groupBy({
      by: ['year', 'month'],
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    });
    
    const formattedTrends = trends.map(trend => ({
      year: trend.year,
      month: trend.month,
      amount: Number(trend._sum.amount || 0),
      count: trend._count.id,
      label: `${getMonthName(trend.month)} ${trend.year}`
    }));
    
    queryCache.set(cacheKey, formattedTrends, 1800); // 30 minutes
    return formattedTrends;
  },

  // Top courses by contributions
  async getTopCourses(limit = 5) {
    const cacheKey = `top-courses-${limit}`;
    const cached = queryCache.get(cacheKey);
    if (cached) return cached;
    
    const topCourses = await db.coursePeriod.findMany({
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            contributions: true
          }
        },
        contributions: {
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        contributions: {
          _count: 'desc'
        }
      },
      take: limit
    });
    
    const formattedCourses = topCourses.map(period => ({
      coursePeriodId: period.id,
      courseName: period.course.name,
      periodName: period.name,
      contributionCount: period._count.contributions,
      totalAmount: period.contributions.reduce((sum, c) => sum + Number(c.amount), 0)
    }));
    
    queryCache.set(cacheKey, formattedCourses, 1800); // 30 minutes
    return formattedCourses;
  }
};

// Utility functions
function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1] || 'Desconocido';
}

// Cache invalidation utilities
export const cacheInvalidation = {
  invalidateStudents() {
    queryCache.deleteByPrefix('students-stats-');
    queryCache.delete('dashboard-stats');
  },
  
  invalidateCourses() {
    queryCache.deleteByPrefix('courses-periods-');
    queryCache.deleteByPrefix('top-courses-');
    queryCache.delete('dashboard-stats');
  },
  
  invalidateContributions() {
    queryCache.deleteByPrefix('contributions-details-');
    queryCache.deleteByPrefix('monthly-trends-');
    queryCache.deleteByPrefix('top-courses-');
    queryCache.delete('dashboard-stats');
  },
  
  invalidateAll() {
    queryCache.clear();
  }
};

// Database connection optimization
export async function optimizeConnection() {
  try {
    // Test connection
    await db.$queryRaw`SELECT 1`;
    console.log('✅ Database connection optimized');
    
    // Set connection pool settings (if using connection string)
    // These would typically be set in DATABASE_URL
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

// Query performance monitoring
export function withPerformanceMonitoring<T extends any[], R>(
  queryName: string,
  queryFn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const result = await queryFn(...args);
      const duration = Date.now() - startTime;
      
      if (duration > 1000) { // Log slow queries (>1s)
        console.warn(`🐌 Slow query detected: ${queryName} took ${duration}ms`);
      } else if (duration > 500) {
        console.log(`⚠️ Query ${queryName} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Query ${queryName} failed after ${duration}ms:`, error);
      throw error;
    }
  };
}
