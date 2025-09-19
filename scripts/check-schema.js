// Script para verificar la estructura actual de la tabla courses
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    console.log('🔍 Verificando estructura de la tabla courses...');
    
    // Intentar obtener información de la tabla
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📊 Columnas en la tabla courses:');
    console.table(result);
    
    // Intentar obtener un curso para ver qué campos están disponibles
    const sampleCourse = await prisma.course.findFirst();
    if (sampleCourse) {
      console.log('📝 Ejemplo de curso:');
      console.log(JSON.stringify(sampleCourse, null, 2));
    } else {
      console.log('📝 No hay cursos en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
