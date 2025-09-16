import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Schema para validar aportes
const AporteSchema = z.object({
  estudianteId: z.string().min(1, 'ID de estudiante requerido'),
  monto: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  mes: z.number().int().min(1).max(12, 'Mes debe estar entre 1 y 12'),
  anio: z.number().int().min(2020).max(2030, 'Año debe estar entre 2020 y 2030'),
});

const BatchAportesSchema = z.object({
  aportes: z.array(AporteSchema),
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
    const mes = url.searchParams.get('mes');
    const anio = url.searchParams.get('anio');

    // Verificar que el período existe y pertenece al curso
    const periodo = await db.cursoPeriodo.findFirst({
      where: {
        id: periodoId,
        cursoId: cursoId,
      },
      include: {
        curso: true,
      },
    });

    if (!periodo) {
      return NextResponse.json({ error: 'Período no encontrado' }, { status: 404 });
    }

    // Construir filtros
    const whereClause: any = {
      cursoPeriodoId: periodoId,
    };

    if (mes) whereClause.mes = parseInt(mes);
    if (anio) whereClause.anio = parseInt(anio);

    // Obtener aportes con información del estudiante
    const aportes = await db.aporte.findMany({
      where: whereClause,
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
          },
        },
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' },
        { estudiante: { apellido: 'asc' } },
      ],
    });

    // Obtener estadísticas del período
    const totalAportes = await db.aporte.count({
      where: { cursoPeriodoId: periodoId },
    });

    const totalRecaudado = await db.aporte.aggregate({
      where: { cursoPeriodoId: periodoId },
      _sum: { monto: true },
    });

    const totalMatriculados = await db.matricula.count({
      where: { cursoPeriodoId: periodoId },
    });

    return NextResponse.json({
      aportes,
      estadisticas: {
        totalAportes,
        totalRecaudado: totalRecaudado._sum.monto || 0,
        totalMatriculados,
        porcentajeParticipacion: totalMatriculados > 0 
          ? Math.round((totalAportes / totalMatriculados) * 100) 
          : 0,
      },
      periodo: {
        id: periodo.id,
        nombre: periodo.nombre,
        mesesHabilitados: periodo.mesesHabilitados,
        curso: {
          id: periodo.curso.id,
          nombre: periodo.curso.nombre,
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
    const periodo = await db.cursoPeriodo.findFirst({
      where: {
        id: periodoId,
        cursoId: cursoId,
      },
    });

    if (!periodo) {
      return NextResponse.json({ error: 'Período no encontrado' }, { status: 404 });
    }

    // Validar si es batch o individual
    let aportes: any[];
    
    if (Array.isArray(body.aportes)) {
      // Batch de aportes
      const validation = BatchAportesSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Datos inválidos', details: validation.error.issues },
          { status: 400 }
        );
      }
      aportes = validation.data.aportes;
    } else {
      // Aporte individual
      const validation = AporteSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Datos inválidos', details: validation.error.issues },
          { status: 400 }
        );
      }
      aportes = [validation.data];
    }

    // Validar que los meses están habilitados
    for (const aporte of aportes) {
      if (!periodo.mesesHabilitados.includes(aporte.mes)) {
        return NextResponse.json(
          { 
            error: `El mes ${aporte.mes} no está habilitado para este período`,
            mesNoHabilitado: aporte.mes,
            mesesHabilitados: periodo.mesesHabilitados
          },
          { status: 400 }
        );
      }
    }

    // Verificar que los estudiantes están matriculados
    const estudiantesIds = aportes.map(a => a.estudianteId);
    const matriculas = await db.matricula.findMany({
      where: {
        cursoPeriodoId: periodoId,
        estudianteId: { in: estudiantesIds },
      },
    });

    const estudiantesMatriculados = matriculas.map(m => m.estudianteId);
    const estudiantesNoMatriculados = estudiantesIds.filter(
      id => !estudiantesMatriculados.includes(id)
    );

    if (estudiantesNoMatriculados.length > 0) {
      return NextResponse.json(
        { 
          error: 'Algunos estudiantes no están matriculados en este período',
          estudiantesNoMatriculados
        },
        { status: 400 }
      );
    }

    // Crear aportes usando upsert para evitar duplicados
    const resultados = [];
    const errores = [];

    for (const aporteData of aportes) {
      try {
        const aporte = await db.aporte.upsert({
          where: {
            estudianteId_cursoPeriodoId_mes_anio: {
              estudianteId: aporteData.estudianteId,
              cursoPeriodoId: periodoId,
              mes: aporteData.mes,
              anio: aporteData.anio,
            },
          },
          update: {
            monto: aporteData.monto,
          },
          create: {
            estudianteId: aporteData.estudianteId,
            cursoPeriodoId: periodoId,
            monto: aporteData.monto,
            mes: aporteData.mes,
            anio: aporteData.anio,
            concepto: 'Aporte voluntario mensual',
          },
          include: {
            estudiante: {
              select: {
                nombre: true,
                apellido: true,
                dni: true,
              },
            },
          },
        });

        resultados.push(aporte);
      } catch (error: any) {
        errores.push({
          estudianteId: aporteData.estudianteId,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: `${resultados.length} aportes procesados exitosamente`,
      aportes: resultados,
      errores: errores.length > 0 ? errores : undefined,
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

    const validation = AporteSchema.extend({
      aporteId: z.string().optional(),
    }).safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { estudianteId, monto, mes, anio } = validation.data;

    // Verificar que el período existe
    const periodo = await db.cursoPeriodo.findUnique({
      where: { id: periodoId },
    });

    if (!periodo) {
      return NextResponse.json({ error: 'Período no encontrado' }, { status: 404 });
    }

    // Validar mes habilitado
    if (!periodo.mesesHabilitados.includes(mes)) {
      return NextResponse.json(
        { error: `El mes ${mes} no está habilitado para este período` },
        { status: 400 }
      );
    }

    // Actualizar o crear aporte
    const aporte = await db.aporte.upsert({
      where: {
        estudianteId_cursoPeriodoId_mes_anio: {
          estudianteId,
          cursoPeriodoId: periodoId,
          mes,
          anio,
        },
      },
      update: { monto },
      create: {
        estudianteId,
        cursoPeriodoId: periodoId,
        monto,
        mes,
        anio,
        concepto: 'Aporte voluntario mensual',
      },
      include: {
        estudiante: {
          select: {
            nombre: true,
            apellido: true,
            dni: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Aporte actualizado exitosamente',
      aporte,
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
    const estudianteId = url.searchParams.get('estudianteId');
    const mes = url.searchParams.get('mes');
    const anio = url.searchParams.get('anio');

    if (!estudianteId || !mes || !anio) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: estudianteId, mes, anio' },
        { status: 400 }
      );
    }

    const aporte = await db.aporte.delete({
      where: {
        estudianteId_cursoPeriodoId_mes_anio: {
          estudianteId,
          cursoPeriodoId: periodoId,
          mes: parseInt(mes),
          anio: parseInt(anio),
        },
      },
    });

    return NextResponse.json({
      message: 'Aporte eliminado exitosamente',
      aporte,
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
