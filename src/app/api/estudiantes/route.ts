import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for student creation/update
const EstudianteSchema = z.object({
  dni: z.string().min(7, 'DNI debe tener al menos 7 dígitos').max(8, 'DNI debe tener máximo 8 dígitos'),
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fechaNacimiento: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

// GET /api/estudiantes - List students with search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { dni: { contains: search } },
        { nombre: { contains: search, mode: 'insensitive' as const } },
        { apellido: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    // Get students with pagination
    const [estudiantes, total] = await Promise.all([
      db.estudiante.findMany({
        where: {
          isActive: true,
          ...whereClause,
        },
        orderBy: [
          { apellido: 'asc' },
          { nombre: 'asc' },
        ],
        skip,
        take: limit,
        include: {
          matriculas: {
            include: {
              cursoPeriodo: {
                include: {
                  curso: true,
                },
              },
            },
          },
          _count: {
            select: {
              aportes: true,
            },
          },
        },
      }),
      db.estudiante.count({
        where: {
          isActive: true,
          ...whereClause,
        },
      }),
    ]);

    return NextResponse.json({
      estudiantes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/estudiantes - Create or update student (upsert by DNI)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = EstudianteSchema.parse(body);

    // Convert empty email to null
    const emailValue = validatedData.email === '' ? null : validatedData.email;

    // Upsert student by DNI
    const estudiante = await db.estudiante.upsert({
      where: { dni: validatedData.dni },
      update: {
        nombre: validatedData.nombre,
        apellido: validatedData.apellido,
        email: emailValue,
        telefono: validatedData.telefono,
        direccion: validatedData.direccion,
        fechaNacimiento: validatedData.fechaNacimiento,
        isActive: true,
      },
      create: {
        dni: validatedData.dni,
        nombre: validatedData.nombre,
        apellido: validatedData.apellido,
        email: emailValue,
        telefono: validatedData.telefono,
        direccion: validatedData.direccion,
        fechaNacimiento: validatedData.fechaNacimiento,
      },
      include: {
        matriculas: {
          include: {
            cursoPeriodo: {
              include: {
                curso: true,
              },
            },
          },
        },
        _count: {
          select: {
            aportes: true,
          },
        },
      },
    });

    return NextResponse.json(estudiante, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating/updating student:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
