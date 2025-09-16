import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Schema para validar aportes
const ContributionSchema = z.object({
  studentId: z.string().min(1, 'ID de estudiante requerido'),
  amount: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  month: z.number().int().min(1).max(12, 'Mes debe estar entre 1 y 12'),
  year: z.number().int().min(2020).max(2030, 'Año debe estar entre 2020 y 2030'),
});

const BatchContributionsSchema = z.object({
  contributions: z.array(ContributionSchema),
});

// GET - Obtener aportes de un período específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; periodoId: string }> }
) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const { id: cursoId, periodoId } = params;
    const url = new URL(request.url);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');

    // Verificar que el período existe y pertenece al curso
    const period = await db.coursePeriod.findFirst({
      where: {
        id: periodoId,
        courseId: cursoId,
      },
      include: {
        course: true,
      },
    });

    if (!period) {
      return NextResponse.json({ error: 'Período no encontrado' }, { status: 404 });
    }

    // Construir filtros
    const whereClause: any = {
      coursePeriodId: periodoId,
    };

    if (month) whereClause.month = parseInt(month);
    if (year) whereClause.year = parseInt(year);

    // Obtener aportes con información del estudiante
    const contributions = await db.contribution.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { student: { lastName: 'asc' } },
      ],
    });

    // Obtener estadísticas del período
    const totalContributions = await db.contribution.count({
      where: { coursePeriodId: periodoId },
    });

    const totalCollected = await db.contribution.aggregate({
      where: { coursePeriodId: periodoId },
      _sum: { amount: true },
    });

    const totalEnrolled = await db.enrollment.count({
      where: { coursePeriodId: periodoId },
    });

    return NextResponse.json({
      contributions,
      statistics: {
        totalContributions,
        totalCollected: totalCollected._sum.amount || 0,
        totalEnrolled,
        participationPercentage: totalEnrolled > 0 
          ? Math.round((totalContributions / totalEnrolled) * 100) 
          : 0,
      },
      period: {
        id: period.id,
        name: period.name,
        enabledMonths: period.enabledMonths,
        course: {
          id: period.course.id,
          name: period.course.name,
        },
      },
    });

  } catch (error) {
    console.error('Error al obtener aportes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear aportes (batch o individual)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; periodoId: string }> }
) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const { id: cursoId, periodoId } = params;
    const body = await request.json();

    // Verificar que el período existe y pertenece al curso
    const period = await db.coursePeriod.findFirst({
      where: {
        id: periodoId,
        courseId: cursoId,
      },
    });

    if (!period) {
      return NextResponse.json({ error: 'Período no encontrado' }, { status: 404 });
    }

    // Validar si es batch o individual
    let contributions: any[];
    
    if (Array.isArray(body.contributions)) {
      // Batch de aportes
      const validation = BatchContributionsSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Datos inválidos', details: validation.error.issues },
          { status: 400 }
        );
      }
      contributions = validation.data.contributions;
    } else {
      // Aporte individual
      const validation = ContributionSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Datos inválidos', details: validation.error.issues },
          { status: 400 }
        );
      }
      contributions = [validation.data];
    }

    // Validar que los meses están habilitados
    for (const contribution of contributions) {
      if (!period.enabledMonths.includes(contribution.month)) {
        return NextResponse.json(
          { 
            error: `El mes ${contribution.month} no está habilitado para este período`,
            monthNotEnabled: contribution.month,
            enabledMonths: period.enabledMonths
          },
          { status: 400 }
        );
      }
    }

    // Verificar que los estudiantes están matriculados
    const studentIds = contributions.map(c => c.studentId);
    const enrollments = await db.enrollment.findMany({
      where: {
        coursePeriodId: periodoId,
        studentId: { in: studentIds },
      },
    });

    const enrolledStudents = enrollments.map(e => e.studentId);
    const notEnrolledStudents = studentIds.filter(
      id => !enrolledStudents.includes(id)
    );

    if (notEnrolledStudents.length > 0) {
      return NextResponse.json(
        { 
          error: 'Algunos estudiantes no están matriculados en este período',
          notEnrolledStudents
        },
        { status: 400 }
      );
    }

    // Crear aportes usando upsert para evitar duplicados
    const results = [];
    const errors = [];

    for (const contributionData of contributions) {
      try {
        const contribution = await db.contribution.upsert({
          where: {
            studentId_coursePeriodId_month_year: {
              studentId: contributionData.studentId,
              coursePeriodId: periodoId,
              month: contributionData.month,
              year: contributionData.year,
            },
          },
          update: {
            amount: contributionData.amount,
          },
          create: {
            studentId: contributionData.studentId,
            coursePeriodId: periodoId,
            amount: contributionData.amount,
            month: contributionData.month,
            year: contributionData.year,
            concept: 'Aporte voluntario mensual',
          },
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                dni: true,
              },
            },
          },
        });

        results.push(contribution);
      } catch (error: any) {
        errors.push({
          studentId: contributionData.studentId,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: `${results.length} aportes procesados exitosamente`,
      contributions: results,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error al crear aportes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar aporte específico
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; periodoId: string }> }
) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const { periodoId } = params;
    const body = await request.json();

    const validation = ContributionSchema.extend({
      contributionId: z.string().optional(),
    }).safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { studentId, amount, month, year } = validation.data;

    // Verificar que el período existe
    const period = await db.coursePeriod.findUnique({
      where: { id: periodoId },
    });

    if (!period) {
      return NextResponse.json({ error: 'Período no encontrado' }, { status: 404 });
    }

    // Validar mes habilitado
    if (!period.enabledMonths.includes(month)) {
      return NextResponse.json(
        { error: `El mes ${month} no está habilitado para este período` },
        { status: 400 }
      );
    }

    // Actualizar o crear aporte
    const contribution = await db.contribution.upsert({
      where: {
        studentId_coursePeriodId_month_year: {
          studentId,
          coursePeriodId: periodoId,
          month,
          year,
        },
      },
      update: { amount },
      create: {
        studentId,
        coursePeriodId: periodoId,
        amount,
        month,
        year,
        concept: 'Aporte voluntario mensual',
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Aporte actualizado exitosamente',
      contribution,
    });

  } catch (error) {
    console.error('Error al actualizar aporte:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar aporte específico
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; periodoId: string }> }
) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const { periodoId } = params;
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');

    if (!studentId || !month || !year) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: studentId, month, year' },
        { status: 400 }
      );
    }

    const contribution = await db.contribution.delete({
      where: {
        studentId_coursePeriodId_month_year: {
          studentId,
          coursePeriodId: periodoId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
    });

    return NextResponse.json({
      message: 'Aporte eliminado exitosamente',
      contribution,
    });

  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Aporte no encontrado' },
        { status: 404 }
      );
    }

    console.error('Error al eliminar aporte:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
