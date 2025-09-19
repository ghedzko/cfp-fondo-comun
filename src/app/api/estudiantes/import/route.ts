import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for CSV student data
const studentCsvSchema = z.object({
  dni: z.string().min(7, 'DNI debe tener al menos 7 dígitos').max(8, 'DNI debe tener máximo 8 dígitos'),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(), // Will be parsed as date
});

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    row: number;
    dni: string;
    error: string;
  }>;
  duplicates: Array<{
    row: number;
    dni: string;
    existingStudent: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

// POST /api/estudiantes/import - Import students from CSV data
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    if (!authResult.user || authResult.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden importar estudiantes.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { csvData, skipDuplicates = true } = body;

    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json(
        { error: 'Datos CSV requeridos' },
        { status: 400 }
      );
    }

    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
      duplicates: [],
    };

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 1;

      try {
        // Validate row data
        const validatedData = studentCsvSchema.parse(row);

        // Check if student already exists
        const existingStudent = await db.student.findUnique({
          where: { dni: validatedData.dni },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        });

        if (existingStudent) {
          result.duplicates.push({
            row: rowNumber,
            dni: validatedData.dni,
            existingStudent,
          });

          if (skipDuplicates) {
            result.skipped++;
            continue;
          } else {
            result.errors.push({
              row: rowNumber,
              dni: validatedData.dni,
              error: 'Estudiante ya existe',
            });
            continue;
          }
        }

        // Parse birth date if provided
        let birthDate: Date | null = null;
        if (validatedData.birthDate) {
          const parsedDate = new Date(validatedData.birthDate);
          if (!isNaN(parsedDate.getTime())) {
            birthDate = parsedDate;
          }
        }

        // Create student
        await db.student.create({
          data: {
            dni: validatedData.dni,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email || null,
            phone: validatedData.phone || null,
            address: validatedData.address || null,
            birthDate: birthDate,
            isActive: true,
          },
        });

        result.imported++;

      } catch (error) {
        if (error instanceof z.ZodError) {
          result.errors.push({
            row: rowNumber,
            dni: row.dni || 'N/A',
            error: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
          });
        } else {
          result.errors.push({
            row: rowNumber,
            dni: row.dni || 'N/A',
            error: 'Error procesando fila',
          });
        }
      }
    }

    // Set success to false if there were errors
    if (result.errors.length > 0) {
      result.success = false;
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error importing students:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/estudiantes/import - Get CSV template
export async function GET() {
  try {
    const template = [
      {
        dni: '12345678',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        phone: '2944123456',
        address: 'Av. San Martín 123',
        birthDate: '1990-05-15',
      },
      {
        dni: '87654321',
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@email.com',
        phone: '2944654321',
        address: 'Calle Rivadavia 456',
        birthDate: '1985-10-20',
      },
    ];

    return NextResponse.json({
      template,
      fields: [
        { name: 'dni', required: true, description: 'DNI del estudiante (7-8 dígitos)' },
        { name: 'firstName', required: true, description: 'Nombre del estudiante' },
        { name: 'lastName', required: true, description: 'Apellido del estudiante' },
        { name: 'email', required: false, description: 'Email del estudiante' },
        { name: 'phone', required: false, description: 'Teléfono del estudiante' },
        { name: 'address', required: false, description: 'Dirección del estudiante' },
        { name: 'birthDate', required: false, description: 'Fecha de nacimiento (YYYY-MM-DD)' },
      ],
    });

  } catch (error) {
    console.error('Error getting template:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
