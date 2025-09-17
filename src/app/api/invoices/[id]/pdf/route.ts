import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/invoices/[id]/pdf - Generate PDF for invoice
export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const params = await context.params;
    const { id } = params;

    // Get invoice with all related data
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

    // Get detailed student information with contribution status
    const studentsWithContributions = invoice.coursePeriod.enrollments.map(enrollment => {
      const contribution = relevantContributions.find(c => c.studentId === enrollment.studentId);
      return {
        ...enrollment.student,
        contribution: contribution ? {
          amount: contribution.amount,
          paymentDate: contribution.paymentDate,
          paymentMethod: contribution.paymentMethod,
          receipt: contribution.receipt
        } : null,
        hasContributed: !!contribution
      };
    });

    // Generate PDF content
    const pdfData = {
      invoice: {
        id: invoice.id,
        month: invoice.month,
        year: invoice.year,
        totalAmount: invoice.totalAmount,
        dueDate: invoice.dueDate,
        status: invoice.status,
        notes: invoice.notes,
        createdAt: invoice.createdAt
      },
      course: {
        name: invoice.coursePeriod.course.name,
        description: invoice.coursePeriod.course.description
      },
      coursePeriod: {
        name: invoice.coursePeriod.name,
        startDate: invoice.coursePeriod.startDate,
        endDate: invoice.coursePeriod.endDate,
        monthlyPrice: invoice.coursePeriod.monthlyPrice
      },
      statistics: {
        enrolledStudents,
        contributingStudents,
        totalContributions,
        collectionRate: enrolledStudents > 0 ? (contributingStudents / enrolledStudents) * 100 : 0,
        expectedAmount: Number(invoice.totalAmount),
        collectionDeficit: Number(invoice.totalAmount) - totalContributions
      },
      students: studentsWithContributions,
      cfpInfo: {
        name: 'CFP Fondo Común - Lago Puelo',
        address: 'Lago Puelo, Chubut, Argentina',
        phone: 'Tel: (02944) XXX-XXX',
        email: 'info@cfp-lagopuelo.edu.ar'
      }
    };

    // Return PDF data for client-side generation
    // (We'll generate the PDF on the client side to avoid server-side PDF generation complexity)
    return NextResponse.json({
      pdfData,
      filename: `factura-${invoice.coursePeriod.course.name.replace(/\s+/g, '-')}-${invoice.month}-${invoice.year}.pdf`
    });

  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
