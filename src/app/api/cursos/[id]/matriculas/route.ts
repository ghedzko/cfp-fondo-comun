import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for enrollment
const MatriculaSchema = z.object({
  estudianteId: z.string().cuid('ID de estudiante inválido'),
  observaciones: z.string().optional(),
});

// Schema for batch enrollment
const BatchMatriculaSchema = z.object({
  estudiantes: z.array(z.object({
    dni: z.string().min(7).max(8),
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    email: z.string().email().optional().or(z.literal('')),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    fechaNacimiento: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  })),
  observaciones: z.string().optional(),
});

// GET /api/cursos/[id]/matriculas - Get enrollments for a course period
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const matriculas = await db.matricula.findMany({
      where: { cursoPeriodoId: id },
      include: {
        estudiante: true,
        cursoPeriodo: {
          include: {
            curso: true,
          },
        },
      },
      orderBy: [
        { estudiante: { apellido: 'asc' } },
        { estudiante: { nombre: 'asc' } },
      ],
    });

    return NextResponse.json(matriculas);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/cursos/[id]/matriculas - Enroll student(s) in course period
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    
    // Check if it's batch enrollment
    if (body.estudiantes && Array.isArray(body.estudiantes)) {
      const validatedData = BatchMatriculaSchema.parse(body);
      
      // Verify course period exists
      const cursoPeriodo = await db.cursoPeriodo.findUnique({
        where: { id },
        include: { curso: true },
      });

      if (!cursoPeriodo) {
        return NextResponse.json(
          { error: 'Período de curso no encontrado' },
          { status: 404 }
        );
      }

      const results = [];
      const errors = [];

      // Process each student
      for (const estudianteData of validatedData.estudiantes) {
        try {
          // Upsert student
          const emailValue = estudianteData.email === '' ? null : estudianteData.email;
          
          const estudiante = await db.estudiante.upsert({
            where: { dni: estudianteData.dni },
            update: {
              nombre: estudianteData.nombre,
              apellido: estudianteData.apellido,
              email: emailValue,
              telefono: estudianteData.telefono,
              direccion: estudianteData.direccion,
              fechaNacimiento: estudianteData.fechaNacimiento,
              isActive: true,
            },
            create: {
              dni: estudianteData.dni,
              nombre: estudianteData.nombre,
              apellido: estudianteData.apellido,
              email: emailValue,
              telefono: estudianteData.telefono,
              direccion: estudianteData.direccion,
              fechaNacimiento: estudianteData.fechaNacimiento,
            },
          });

          // Create enrollment
          const matricula = await db.matricula.create({
            data: {
              estudianteId: estudiante.id,
              cursoPeriodoId: id,
              observaciones: validatedData.observaciones,
            },
            include: {
              estudiante: true,
              cursoPeriodo: {
                include: {
                  curso: true,
                },
              },
            },
          });

          results.push(matricula);
        } catch (error: any) {
          if (error.code === 'P2002') {
            errors.push({
              dni: estudianteData.dni,
              error: 'El estudiante ya está matriculado en este curso',
            });
          } else {
            errors.push({
              dni: estudianteData.dni,
              error: 'Error al procesar matrícula',
            });
          }
        }
      }

      return NextResponse.json({
        success: results,
        errors,
        summary: {
          total: validatedData.estudiantes.length,
          successful: results.length,
          failed: errors.length,
        },
      });
    } else {
      // Single enrollment
      const validatedData = MatriculaSchema.parse(body);

      // Verify course period exists
      const cursoPeriodo = await db.cursoPeriodo.findUnique({
        where: { id },
      });

      if (!cursoPeriodo) {
        return NextResponse.json(
          { error: 'Período de curso no encontrado' },
          { status: 404 }
        );
      }

      // Verify student exists
      const estudiante = await db.estudiante.findUnique({
        where: { id: validatedData.estudianteId },
      });

      if (!estudiante) {
        return NextResponse.json(
          { error: 'Estudiante no encontrado' },
          { status: 404 }
        );
      }

      // Create enrollment
      const matricula = await db.matricula.create({
        data: {
          estudianteId: validatedData.estudianteId,
          cursoPeriodoId: id,
          observaciones: validatedData.observaciones,
        },
        include: {
          estudiante: true,
          cursoPeriodo: {
            include: {
              curso: true,
            },
          },
        },
      });

      return NextResponse.json(matricula, { status: 201 });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El estudiante ya está matriculado en este curso' },
        { status: 409 }
      );
    }

    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
