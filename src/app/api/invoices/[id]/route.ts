import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Invoice update schema
const updateInvoiceSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/invoices/[id] - Get invoice by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    const invoice = await db.courseInvoice.findUnique({
      where: { id },
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
                month: undefined, // Will be filtered by invoice month/year
                year: undefined
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Filter contributions for this specific month/year
    const relevantContributions = invoice.coursePeriod.contributions.filter(
      c => c.month === invoice.month && c.year === invoice.year
    );

    // Calculate statistics
    const enrolledStudents = invoice.coursePeriod.enrollments.length;
    const contributingStudents = new Set(relevantContributions.map(c => c.studentId)).size;
    const totalContributions = relevantContributions.reduce((sum, c) => sum + Number(c.amount), 0);
    const collectionRate = enrolledStudents > 0 ? (contributingStudents / enrolledStudents) * 100 : 0;

    // Get detailed student information with contribution status
    const studentsWithContributions = invoice.coursePeriod.enrollments.map(enrollment => {
      const contribution = relevantContributions.find(c => c.studentId === enrollment.studentId);
      return {
        ...enrollment.student,
        enrollmentId: enrollment.id,
        enrollmentDate: enrollment.enrollmentDate,
        contribution: contribution ? {
          id: contribution.id,
          amount: contribution.amount,
          paymentDate: contribution.paymentDate,
          paymentMethod: contribution.paymentMethod,
          receipt: contribution.receipt,
          notes: contribution.notes
        } : null,
        hasContributed: !!contribution
      };
    });

    const invoiceWithDetails = {
      ...invoice,
      coursePeriod: {
        ...invoice.coursePeriod,
        contributions: relevantContributions
      },
      statistics: {
        enrolledStudents,
        contributingStudents,
        totalContributions,
        collectionRate,
        expectedAmount: Number(invoice.totalAmount),
        collectionDeficit: Number(invoice.totalAmount) - totalContributions
      },
      studentsWithContributions
    };

    return NextResponse.json({ invoice: invoiceWithDetails });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    
    const result = updateInvoiceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.issues },
        { status: 400 }
      );
    }

    // Check if invoice exists
    const existingInvoice = await db.courseInvoice.findUnique({
      where: { id }
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update invoice
    const updatedInvoice = await db.courseInvoice.update({
      where: { id },
      data: result.data,
      include: {
        coursePeriod: {
          include: {
            course: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Invoice updated successfully',
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if invoice exists
    const existingInvoice = await db.courseInvoice.findUnique({
      where: { id }
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of PENDING or CANCELLED invoices
    if (existingInvoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid invoices' },
        { status: 400 }
      );
    }

    // Delete invoice
    await db.courseInvoice.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
