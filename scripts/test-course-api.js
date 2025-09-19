// Script para probar el API de cursos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCourseAPI() {
  try {
    console.log('🔍 Probando API de cursos...');
    
    // Obtener todos los cursos
    const courses = await prisma.course.findMany({
      include: {
        periods: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
          include: {
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
        _count: {
          select: {
            periods: true,
          },
        },
      },
    });
    
    console.log(`📊 Encontrados ${courses.length} cursos`);
    
    if (courses.length > 0) {
      const course = courses[0];
      console.log('\n📝 Primer curso:');
      console.log(`ID: ${course.id}`);
      console.log(`Nombre: ${course.name}`);
      console.log(`Área: ${course.areaCode}`);
      console.log(`Código: ${course.profileCode}`);
      console.log(`Duración: ${course.duration} horas`);
      console.log(`Precio: $${course.price}`);
      console.log(`Requisitos: ${course.requirements}`);
      console.log(`Certificación: ${course.certificateLevel} - ${course.certification}`);
      console.log(`Períodos: ${course._count.periods}`);
      
      // Simular respuesta del API
      const apiResponse = { course };
      console.log('\n🔧 Respuesta del API:');
      console.log(JSON.stringify(apiResponse, null, 2));
    } else {
      console.log('❌ No hay cursos en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCourseAPI();
