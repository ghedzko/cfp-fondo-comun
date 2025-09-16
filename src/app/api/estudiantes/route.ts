import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for student creation/update
const StudentSchema = z.object({
  dni: z.string().min(7, 'DNI debe tener al menos 7 dígitos').max(8, 'DNI debe tener máximo 8 dígitos'),
  firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
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
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    // Get students with pagination
    const [students, total] = await Promise.all([
      db.student.findMany({
        where: {
          isActive: true,
          ...whereClause,
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        skip,
        take: limit,
        include: {
          enrollments: {
            include: {
              coursePeriod: {
                include: {
                  course: true,
                },
              },
            },
          },
          _count: {
            select: {
              contributions: true,
            },
          },
        },
      }),
      db.student.count({
        where: {
          isActive: true,
          ...whereClause,
        },
      }),
    ]);

    return NextResponse.json({
      students,
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
    const validatedData = StudentSchema.parse(body);

    // Convert empty email to null
    const emailValue = validatedData.email === '' ? null : validatedData.email;

    // Upsert student by DNI
    const student = await db.student.upsert({
      where: { dni: validatedData.dni },
      update: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: emailValue,
        phone: validatedData.phone,
        address: validatedData.address,
        birthDate: validatedData.birthDate,
        isActive: true,
      },
      create: {
        dni: validatedData.dni,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: emailValue,
        phone: validatedData.phone,
        address: validatedData.address,
        birthDate: validatedData.birthDate,
      },
      include: {
        enrollments: {
          include: {
            coursePeriod: {
              include: {
                course: true,
              },
            },
          },
        },
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });

    return NextResponse.json(student, { status: 201 });
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
