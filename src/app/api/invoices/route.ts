import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Invoice creation schema
const createInvoiceSchema = z.object({
  coursePeriodId: z.string().min(1, 'Course period ID is required'),
  month: z.number().int().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(2020).max(2030, 'Year must be between 2020 and 2030'),
  dueDate: z.string().transform((str) => new Date(str)),
  notes: z.string().optional(),
});

// Invoice query schema
const querySchema = z.object({
  coursePeriodId: z.string().optional(),
  courseId: z.string().optional(),
  month: z.string().transform((val) => parseInt(val)).optional(),
  year: z.string().transform((val) => parseInt(val)).optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  page: z.string().transform((val) => parseInt(val)).default(() => 1),
  limit: z.string().transform((val) => parseInt(val)).default(() => 10),
});

// GET /api/invoices - List invoices with filters
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const result = querySchema.safeParse(queryParams);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.issues },
        { status: 400 }
      );
    }

    const { coursePeriodId, courseId, month, year, status, page, limit } = result.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (coursePeriodId) {
      where.coursePeriodId = coursePeriodId;
    }
    
    if (courseId) {
      where.coursePeriod = {
        courseId: courseId
      };
    }
    
    if (month) where.month = month;
    if (year) where.year = year;
    if (status) where.status = status;

    // Get invoices with related data
    const [invoices, total] = await Promise.all([
      db.courseInvoice.findMany({
        where,
        include: {
          coursePeriod: {
            include: {
              course: true,
              enrollments: {
                where: { status: 'ACTIVE' },
                include: {
                  student: true
                }
              },
              contributions: {
                where: {
                  month: month || undefined,
                  year: year || undefined
                }
              }
            }
          }
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      db.courseInvoice.count({ where })
    ]);

    // Calculate statistics for each invoice
    const invoicesWithStats = invoices.map(invoice => {
      const enrolledStudents = invoice.coursePeriod.enrollments.length;
      const contributions = invoice.coursePeriod.contributions;
      const contributingStudents = new Set(contributions.map(c => c.studentId)).size;
      const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0);
      
      return {
        ...invoice,
        statistics: {
          enrolledStudents,
          contributingStudents,
          totalContributions,
          collectionRate: enrolledStudents > 0 ? (contributingStudents / enrolledStudents) * 100 : 0
        }
      };
    });

    return NextResponse.json({
      invoices: invoicesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createInvoiceSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.issues },
        { status: 400 }
      );
    }

    const { coursePeriodId, month, year, dueDate, notes } = result.data;

    // Verify course period exists and is active
    const coursePeriod = await db.coursePeriod.findUnique({
      where: { id: coursePeriodId },
      include: {
        course: true,
        enrollments: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!coursePeriod) {
      return NextResponse.json(
        { error: 'Course period not found' },
        { status: 404 }
      );
    }

    if (!coursePeriod.isActive) {
      return NextResponse.json(
        { error: 'Course period is not active' },
        { status: 400 }
      );
    }

    // Check if month is enabled for this course period
    if (!coursePeriod.enabledMonths.includes(month)) {
      return NextResponse.json(
        { error: 'Month is not enabled for this course period' },
        { status: 400 }
      );
    }

    // Calculate total amount based on enrolled students and monthly price
    const enrolledStudents = coursePeriod.enrollments.length;
    const totalAmount = Number(coursePeriod.monthlyPrice) * enrolledStudents;

    // Create invoice
    const invoice = await db.courseInvoice.create({
      data: {
        coursePeriodId,
        month,
        year,
        totalAmount,
        dueDate,
        notes,
      },
      include: {
        coursePeriod: {
          include: {
            course: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Invoice created successfully',
      invoice
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Invoice already exists for this course period, month, and year' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
