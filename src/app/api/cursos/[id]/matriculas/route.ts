import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for enrollment
const EnrollmentSchema = z.object({
  studentId: z.string().cuid('ID de estudiante inválido'),
  notes: z.string().optional(),
});

// Schema for batch enrollment
const BatchEnrollmentSchema = z.object({
  students: z.array(z.object({
    dni: z.string().min(7).max(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    birthDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  })),
  notes: z.string().optional(),
});

// GET /api/cursos/[id]/matriculas - Get enrollments for a course period
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const enrollments = await db.enrollment.findMany({
      where: { coursePeriodId: id },
      include: {
        student: true,
        coursePeriod: {
          include: {
            course: true,
          },
        },
      },
      orderBy: [
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } },
      ],
    });

    return NextResponse.json(enrollments);
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
    if (body.students && Array.isArray(body.students)) {
      const validatedData = BatchEnrollmentSchema.parse(body);
      
      // Verify course period exists
      const coursePeriod = await db.coursePeriod.findUnique({
        where: { id },
        include: { course: true },
      });

      if (!coursePeriod) {
        return NextResponse.json(
          { error: 'Período de curso no encontrado' },
          { status: 404 }
        );
      }

      const results = [];
      const errors = [];

      // Process each student
      for (const studentData of validatedData.students) {
        try {
          // Upsert student
          const emailValue = studentData.email === '' ? null : studentData.email;
          
          const student = await db.student.upsert({
            where: { dni: studentData.dni },
            update: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              email: emailValue,
              phone: studentData.phone,
              address: studentData.address,
              birthDate: studentData.birthDate,
              isActive: true,
            },
            create: {
              dni: studentData.dni,
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              email: emailValue,
              phone: studentData.phone,
              address: studentData.address,
              birthDate: studentData.birthDate,
            },
          });

          // Create enrollment
          const enrollment = await db.enrollment.create({
            data: {
              studentId: student.id,
              coursePeriodId: id,
              notes: validatedData.notes,
            },
            include: {
              student: true,
              coursePeriod: {
                include: {
                  course: true,
                },
              },
            },
          });

          results.push(enrollment);
        } catch (error: unknown) {
          if ((error as any).code === 'P2002') {
            errors.push({
              dni: studentData.dni,
              error: 'El estudiante ya está matriculado en este curso',
            });
          } else {
            errors.push({
              dni: studentData.dni,
              error: 'Error al procesar matrícula',
            });
          }
        }
      }

      return NextResponse.json({
        success: results,
        errors,
        summary: {
          total: validatedData.students.length,
          successful: results.length,
          failed: errors.length,
        },
      });
    } else {
      // Single enrollment
      const validatedData = EnrollmentSchema.parse(body);

      // Verify course period exists
      const coursePeriod = await db.coursePeriod.findUnique({
        where: { id },
      });

      if (!coursePeriod) {
        return NextResponse.json(
          { error: 'Período de curso no encontrado' },
          { status: 404 }
        );
      }

      // Verify student exists
      const student = await db.student.findUnique({
        where: { id: validatedData.studentId },
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Estudiante no encontrado' },
          { status: 404 }
        );
      }

      // Create enrollment
      const enrollment = await db.enrollment.create({
        data: {
          studentId: validatedData.studentId,
          coursePeriodId: id,
          notes: validatedData.notes,
        },
        include: {
          student: true,
          coursePeriod: {
            include: {
              course: true,
            },
          },
        },
      });

      return NextResponse.json(enrollment, { status: 201 });
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    if ((error as any).code === 'P2002') {
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
