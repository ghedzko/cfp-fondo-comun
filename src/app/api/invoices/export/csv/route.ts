import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// CSV export query schema
const csvExportSchema = z.object({
  coursePeriodId: z.string().optional(),
  courseId: z.string().optional(),
  month: z.string().transform((val) => parseInt(val)).optional(),
  year: z.string().transform((val) => parseInt(val)).optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  includeStudentDetails: z.string().transform((val) => val === 'true').default('false'),
});

// Helper function to convert array to CSV
function arrayToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

// Helper function to format date for CSV
function formatDateForCSV(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Helper function to get month name
function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1] || '';
}

// GET /api/invoices/export/csv - Export invoices to CSV
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
    
    const result = csvExportSchema.safeParse(queryParams);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.issues },
        { status: 400 }
      );
    }

    const { coursePeriodId, courseId, month, year, status, includeStudentDetails } = result.data;

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
    const invoices = await db.courseInvoice.findMany({
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
      ]
    });

    if (invoices.length === 0) {
      return NextResponse.json(
        { error: 'No invoices found matching the criteria' },
        { status: 404 }
      );
    }

    let csvData: any[] = [];
    let filename = 'facturas';

    if (includeStudentDetails) {
      // Detailed CSV with student information
      csvData = invoices.flatMap(invoice => {
        const relevantContributions = invoice.coursePeriod.contributions.filter(
          c => c.month === invoice.month && c.year === invoice.year
        );

        return invoice.coursePeriod.enrollments.map(enrollment => {
          const contribution = relevantContributions.find(c => c.studentId === enrollment.studentId);
          
          return {
            'ID Factura': invoice.id,
            'Curso': invoice.coursePeriod.course.name,
            'Período': invoice.coursePeriod.name,
            'Mes': getMonthName(invoice.month),
            'Año': invoice.year,
            'Estado Factura': invoice.status,
            'Monto Total Factura': Number(invoice.totalAmount),
            'Fecha Vencimiento': formatDateForCSV(invoice.dueDate),
            'DNI Estudiante': enrollment.student.dni,
            'Nombre Estudiante': enrollment.student.firstName,
            'Apellido Estudiante': enrollment.student.lastName,
            'Email Estudiante': enrollment.student.email || '',
            'Teléfono Estudiante': enrollment.student.phone || '',
            'Fecha Matrícula': formatDateForCSV(enrollment.enrollmentDate),
            'Estado Matrícula': enrollment.status,
            'Aportó': contribution ? 'Sí' : 'No',
            'Monto Aporte': contribution ? Number(contribution.amount) : 0,
            'Fecha Pago': contribution ? formatDateForCSV(contribution.paymentDate) : '',
            'Método Pago': contribution ? contribution.paymentMethod : '',
            'Comprobante': contribution ? contribution.receipt || '' : '',
            'Precio Mensual': Number(invoice.coursePeriod.monthlyPrice),
            'Notas Factura': invoice.notes || '',
            'Fecha Creación Factura': formatDateForCSV(invoice.createdAt)
          };
        });
      });
      filename = 'facturas-detallado';
    } else {
      // Summary CSV with invoice totals
      csvData = invoices.map(invoice => {
        const relevantContributions = invoice.coursePeriod.contributions.filter(
          c => c.month === invoice.month && c.year === invoice.year
        );

        const enrolledStudents = invoice.coursePeriod.enrollments.length;
        const contributingStudents = new Set(relevantContributions.map(c => c.studentId)).size;
        const totalContributions = relevantContributions.reduce((sum, c) => sum + Number(c.amount), 0);
        const collectionRate = enrolledStudents > 0 ? (contributingStudents / enrolledStudents) * 100 : 0;

        return {
          'ID Factura': invoice.id,
          'Curso': invoice.coursePeriod.course.name,
          'Período': invoice.coursePeriod.name,
          'Mes': getMonthName(invoice.month),
          'Año': invoice.year,
          'Estado': invoice.status,
          'Estudiantes Matriculados': enrolledStudents,
          'Estudiantes que Aportaron': contributingStudents,
          'Tasa de Recaudación (%)': Math.round(collectionRate * 100) / 100,
          'Monto Esperado': Number(invoice.totalAmount),
          'Monto Recaudado': totalContributions,
          'Déficit': Number(invoice.totalAmount) - totalContributions,
          'Precio Mensual': Number(invoice.coursePeriod.monthlyPrice),
          'Fecha Vencimiento': formatDateForCSV(invoice.dueDate),
          'Fecha Creación': formatDateForCSV(invoice.createdAt),
          'Notas': invoice.notes || ''
        };
      });
      filename = 'facturas-resumen';
    }

    // Add filters to filename
    if (month) filename += `-mes-${month}`;
    if (year) filename += `-año-${year}`;
    if (status) filename += `-${status.toLowerCase()}`;
    filename += '.csv';

    // Convert to CSV
    const csvContent = arrayToCSV(csvData);

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error exporting invoices to CSV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
