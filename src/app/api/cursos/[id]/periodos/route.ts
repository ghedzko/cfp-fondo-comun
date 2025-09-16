import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for course period creation/update
const CursoPeriodoSchema = z.object({
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  fechaInicio: z.string().transform((val) => new Date(val)),
  fechaFin: z.string().transform((val) => new Date(val)),
  precioMensual: z.number().positive('Precio debe ser mayor a 0'),
  mesesHabilitados: z.array(z.number().min(1).max(12)).min(1, 'Debe seleccionar al menos un mes'),
});

// GET /api/cursos/[id]/periodos - Get periods for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const periodos = await db.cursoPeriodo.findMany({
      where: { cursoId: id },
      orderBy: { fechaInicio: 'desc' },
      include: {
        curso: true,
        _count: {
          select: {
            matriculas: true,
          },
        },
      },
    });

    return NextResponse.json({ periodos });
  } catch (error) {
    console.error('Error fetching course periods:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/cursos/[id]/periodos - Create new course period
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const validatedData = CursoPeriodoSchema.parse(body);

    // Verify course exists
    const curso = await db.curso.findUnique({
      where: { id },
    });

    if (!curso) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Validate date range
    if (validatedData.fechaInicio >= validatedData.fechaFin) {
      return NextResponse.json(
        { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
        { status: 400 }
      );
    }

    // Create course period
    const periodo = await db.cursoPeriodo.create({
      data: {
        cursoId: id,
        nombre: validatedData.nombre,
        fechaInicio: validatedData.fechaInicio,
        fechaFin: validatedData.fechaFin,
        precioMensual: validatedData.precioMensual,
        // Store enabled months as JSON in a future migration
        // For now, we'll handle this in the UI layer
      },
      include: {
        curso: true,
        _count: {
          select: {
            matriculas: true,
          },
        },
      },
    });

    return NextResponse.json(periodo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating course period:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
