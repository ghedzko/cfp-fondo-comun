// Script para migrar cursos existentes agregando campos del nomenclador
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateExistingCourses() {
  try {
    console.log('🔍 Verificando cursos existentes...');
    
    const existingCourses = await prisma.course.findMany();
    console.log(`📊 Encontrados ${existingCourses.length} cursos`);
    
    if (existingCourses.length === 0) {
      console.log('✅ No hay cursos para migrar');
      return;
    }
    
    // Verificar si ya tienen campos del nomenclador
    const coursesWithoutNomenclador = existingCourses.filter(course => 
      !course.areaCode || !course.profileCode
    );
    
    if (coursesWithoutNomenclador.length === 0) {
      console.log('✅ Todos los cursos ya tienen campos del nomenclador');
      return;
    }
    
    console.log(`🔄 Migrando ${coursesWithoutNomenclador.length} cursos...`);
    
    // Migrar cursos sin campos del nomenclador
    for (const course of coursesWithoutNomenclador) {
      console.log(`📝 Migrando curso: ${course.name}`);
      
      // Asignar valores por defecto basados en el nombre del curso
      let areaCode = 'I'; // Por defecto Gestión
      let profileCode = '99'; // Código genérico
      
      // Detectar área por nombre del curso
      const courseName = course.name.toLowerCase();
      if (courseName.includes('informática') || courseName.includes('computadora') || courseName.includes('pc')) {
        areaCode = 'II';
        profileCode = '99';
      } else if (courseName.includes('secretario') || courseName.includes('administración')) {
        areaCode = 'I';
        profileCode = '99';
      }
      
      await prisma.course.update({
        where: { id: course.id },
        data: {
          areaCode: areaCode,
          profileCode: profileCode,
          requirements: 'A definir',
          certificateLevel: 'Nivel II',
          certification: 'Ministerial',
          // Convertir duración de meses a horas (estimado: 1 mes = 40 horas)
          duration: course.duration * 40,
        }
      });
      
      console.log(`✅ Migrado: ${course.name} (${areaCode}-${profileCode})`);
    }
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingCourses();
