import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Bulk invoice generation schema
const generateInvoicesSchema = z.object({
  month: z.number().int().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(2020).max(2030, 'Year must be between 2020 and 2030'),
  courseIds: z.array(z.string()).optional(), // If not provided, generate for all active courses
  dueDate: z.string().transform((str) => new Date(str)),
  notes: z.string().optional(),
});

// POST /api/invoices/generate - Generate invoices for multiple courses
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
    const result = generateInvoicesSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.issues },
        { status: 400 }
      );
    }

    const { month, year, courseIds, dueDate, notes } = result.data;

    // Build where clause for course periods
    const whereClause: any = {
      isActive: true,
      enabledMonths: {
        has: month // Check if month is in the enabledMonths array
      },
      year: year
    };

    if (courseIds && courseIds.length > 0) {
      whereClause.courseId = {
        in: courseIds
      };
    }

    // Get all eligible course periods
    const coursePeriods = await db.coursePeriod.findMany({
      where: whereClause,
      include: {
        course: true,
        enrollments: {
          where: { status: 'ACTIVE' }
        },
        invoices: {
          where: {
            month: month,
            year: year
          }
        }
      }
    });

    if (coursePeriods.length === 0) {
      return NextResponse.json(
        { error: 'No eligible course periods found for the specified criteria' },
        { status: 404 }
      );
    }

    // Filter out course periods that already have invoices for this month/year
    const periodsWithoutInvoices = coursePeriods.filter(period => period.invoices.length === 0);

    if (periodsWithoutInvoices.length === 0) {
      return NextResponse.json(
        { error: 'All eligible course periods already have invoices for this month/year' },
        { status: 409 }
      );
    }

    // Generate invoices
    const invoicesToCreate = periodsWithoutInvoices.map(period => {
      const enrolledStudents = period.enrollments.length;
      const totalAmount = Number(period.monthlyPrice) * enrolledStudents;

      return {
        coursePeriodId: period.id,
        month,
        year,
        totalAmount,
        dueDate,
        notes: notes || `Factura mensual - ${period.course.name} - ${period.name}`,
      };
    });

    // Create all invoices in a transaction
    const createdInvoices = await db.$transaction(
      invoicesToCreate.map(invoiceData =>
        db.courseInvoice.create({
          data: invoiceData,
          include: {
            coursePeriod: {
              include: {
                course: true
              }
            }
          }
        })
      )
    );

    // Prepare summary
    const summary = {
      totalInvoicesCreated: createdInvoices.length,
      totalAmount: createdInvoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0),
      coursePeriodsProcessed: periodsWithoutInvoices.length,
      coursePeriodsSkipped: coursePeriods.length - periodsWithoutInvoices.length,
      month,
      year,
      dueDate
    };

    return NextResponse.json({
      message: 'Invoices generated successfully',
      summary,
      invoices: createdInvoices
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/invoices/generate - Preview invoice generation
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
    const month = parseInt(searchParams.get('month') || '0');
    const year = parseInt(searchParams.get('year') || '0');
    const courseIds = searchParams.get('courseIds')?.split(',').filter(Boolean);

    if (!month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Valid month (1-12) is required' },
        { status: 400 }
      );
    }

    if (!year || year < 2020 || year > 2030) {
      return NextResponse.json(
        { error: 'Valid year (2020-2030) is required' },
        { status: 400 }
      );
    }

    // Build where clause for course periods
    const whereClause: any = {
      isActive: true,
      enabledMonths: {
        has: month
      },
      year: year
    };

    if (courseIds && courseIds.length > 0) {
      whereClause.courseId = {
        in: courseIds
      };
    }

    // Get all eligible course periods
    const coursePeriods = await db.coursePeriod.findMany({
      where: whereClause,
      include: {
        course: true,
        enrollments: {
          where: { status: 'ACTIVE' }
        },
        invoices: {
          where: {
            month: month,
            year: year
          }
        }
      }
    });

    // Separate periods with and without existing invoices
    const periodsWithInvoices = coursePeriods.filter(period => period.invoices.length > 0);
    const periodsWithoutInvoices = coursePeriods.filter(period => period.invoices.length === 0);

    // Calculate preview data
    const preview = periodsWithoutInvoices.map(period => {
      const enrolledStudents = period.enrollments.length;
      const totalAmount = Number(period.monthlyPrice) * enrolledStudents;

      return {
        coursePeriodId: period.id,
        courseName: period.course.name,
        periodName: period.name,
        enrolledStudents,
        monthlyPrice: period.monthlyPrice,
        totalAmount,
        month,
        year
      };
    });

    const summary = {
      eligiblePeriods: coursePeriods.length,
      periodsWithExistingInvoices: periodsWithInvoices.length,
      periodsToProcess: periodsWithoutInvoices.length,
      estimatedTotalAmount: preview.reduce((sum, p) => sum + p.totalAmount, 0),
      month,
      year
    };

    return NextResponse.json({
      summary,
      preview,
      existingInvoices: periodsWithInvoices.map(period => ({
        coursePeriodId: period.id,
        courseName: period.course.name,
        periodName: period.name,
        invoiceId: period.invoices[0].id,
        status: period.invoices[0].status,
        totalAmount: period.invoices[0].totalAmount
      }))
    });

  } catch (error) {
    console.error('Error previewing invoice generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
