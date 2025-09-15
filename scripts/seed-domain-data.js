const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding domain data...');

  // 1. Create test users (admin and preceptor)
  console.log('👤 Creating test users...');
  
  const adminPassword = await bcrypt.hash('admin123', 12);
  const preceptorPassword = await bcrypt.hash('preceptor123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cfp.edu.ar' },
    update: {},
    create: {
      email: 'admin@cfp.edu.ar',
      password: adminPassword,
      name: 'Administrador CFP',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const preceptor = await prisma.user.upsert({
    where: { email: 'preceptor@cfp.edu.ar' },
    update: {},
    create: {
      email: 'preceptor@cfp.edu.ar',
      password: preceptorPassword,
      name: 'Preceptor CFP',
      role: 'PRECEPTOR',
      isActive: true,
    },
  });

  console.log(`✅ Users created: ${admin.name}, ${preceptor.name}`);

  // 2. Create courses
  console.log('📚 Creating courses...');
  
  const cursoBasico = await prisma.curso.create({
    data: {
      nombre: 'Curso Básico de Computación',
      descripcion: 'Introducción a la informática y herramientas básicas de oficina',
      duracion: 3, // 3 months
      precio: 15000.00,
      isActive: true,
    },
  });

  const cursoAvanzado = await prisma.curso.create({
    data: {
      nombre: 'Curso Avanzado de Programación',
      descripcion: 'Desarrollo web con tecnologías modernas',
      duracion: 6, // 6 months
      precio: 25000.00,
      isActive: true,
    },
  });

  console.log(`✅ Courses created: ${cursoBasico.nombre}, ${cursoAvanzado.nombre}`);

  // 3. Create course periods
  console.log('📅 Creating course periods...');
  
  const periodoBasicoMarzo = await prisma.cursoPeriodo.create({
    data: {
      cursoId: cursoBasico.id,
      nombre: 'Curso Básico - Marzo 2025',
      fechaInicio: new Date('2025-03-01'),
      fechaFin: new Date('2025-05-31'),
      precioMensual: 5000.00,
      isActive: true,
    },
  });

  const periodoAvanzadoAbril = await prisma.cursoPeriodo.create({
    data: {
      cursoId: cursoAvanzado.id,
      nombre: 'Curso Avanzado - Abril 2025',
      fechaInicio: new Date('2025-04-01'),
      fechaFin: new Date('2025-09-30'),
      precioMensual: 4200.00,
      isActive: true,
    },
  });

  console.log(`✅ Course periods created: ${periodoBasicoMarzo.nombre}, ${periodoAvanzadoAbril.nombre}`);

  // 4. Create students
  console.log('👨‍🎓 Creating students...');
  
  const estudiante1 = await prisma.estudiante.create({
    data: {
      dni: '12345678',
      nombre: 'Juan Carlos',
      apellido: 'González',
      email: 'juan.gonzalez@email.com',
      telefono: '+54 294 123-4567',
      direccion: 'Av. San Martín 123, Lago Puelo',
      fechaNacimiento: new Date('1995-06-15'),
      isActive: true,
    },
  });

  const estudiante2 = await prisma.estudiante.create({
    data: {
      dni: '87654321',
      nombre: 'María Elena',
      apellido: 'Rodríguez',
      email: 'maria.rodriguez@email.com',
      telefono: '+54 294 987-6543',
      direccion: 'Calle Rivadavia 456, Lago Puelo',
      fechaNacimiento: new Date('1988-11-22'),
      isActive: true,
    },
  });

  const estudiante3 = await prisma.estudiante.create({
    data: {
      dni: '11223344',
      nombre: 'Carlos Alberto',
      apellido: 'Fernández',
      email: 'carlos.fernandez@email.com',
      telefono: '+54 294 555-1234',
      direccion: 'Barrio Centro, Lago Puelo',
      fechaNacimiento: new Date('1992-03-08'),
      isActive: true,
    },
  });

  console.log(`✅ Students created: ${estudiante1.nombre} ${estudiante1.apellido}, ${estudiante2.nombre} ${estudiante2.apellido}, ${estudiante3.nombre} ${estudiante3.apellido}`);

  // 5. Create enrollments (matriculas)
  console.log('📝 Creating enrollments...');
  
  const matricula1 = await prisma.matricula.create({
    data: {
      estudianteId: estudiante1.id,
      cursoPeriodoId: periodoBasicoMarzo.id,
      fechaMatricula: new Date('2025-02-15'),
      estado: 'ACTIVA',
      observaciones: 'Estudiante muy interesado en aprender',
    },
  });

  const matricula2 = await prisma.matricula.create({
    data: {
      estudianteId: estudiante2.id,
      cursoPeriodoId: periodoAvanzadoAbril.id,
      fechaMatricula: new Date('2025-03-20'),
      estado: 'ACTIVA',
      observaciones: 'Tiene experiencia previa en programación',
    },
  });

  const matricula3 = await prisma.matricula.create({
    data: {
      estudianteId: estudiante3.id,
      cursoPeriodoId: periodoBasicoMarzo.id,
      fechaMatricula: new Date('2025-02-28'),
      estado: 'ACTIVA',
    },
  });

  console.log(`✅ Enrollments created: 3 matriculas`);

  // 6. Create payments (aportes)
  console.log('💰 Creating payments...');
  
  await prisma.aporte.create({
    data: {
      estudianteId: estudiante1.id,
      monto: 5000.00,
      concepto: 'Cuota mensual Marzo 2025',
      fechaPago: new Date('2025-03-05'),
      metodoPago: 'EFECTIVO',
      comprobante: 'REC-001',
      observaciones: 'Pago puntual',
    },
  });

  await prisma.aporte.create({
    data: {
      estudianteId: estudiante2.id,
      monto: 4200.00,
      concepto: 'Cuota mensual Abril 2025',
      fechaPago: new Date('2025-04-10'),
      metodoPago: 'TRANSFERENCIA',
      comprobante: 'TRANS-123456',
    },
  });

  await prisma.aporte.create({
    data: {
      estudianteId: estudiante3.id,
      monto: 2500.00,
      concepto: 'Pago parcial Marzo 2025',
      fechaPago: new Date('2025-03-15'),
      metodoPago: 'EFECTIVO',
      comprobante: 'REC-002',
      observaciones: 'Pago parcial - resta $2500',
    },
  });

  console.log(`✅ Payments created: 3 aportes`);

  // 7. Create course invoices (facturas)
  console.log('🧾 Creating course invoices...');
  
  await prisma.facturaCurso.create({
    data: {
      cursoPeriodoId: periodoBasicoMarzo.id,
      mes: 3, // March
      anio: 2025,
      montoTotal: 10000.00, // 2 students x $5000
      fechaVencimiento: new Date('2025-03-31'),
      estado: 'PAGADA',
      observaciones: 'Factura de Marzo - 2 estudiantes matriculados',
    },
  });

  await prisma.facturaCurso.create({
    data: {
      cursoPeriodoId: periodoAvanzadoAbril.id,
      mes: 4, // April
      anio: 2025,
      montoTotal: 4200.00, // 1 student x $4200
      fechaVencimiento: new Date('2025-04-30'),
      estado: 'PAGADA',
      observaciones: 'Factura de Abril - 1 estudiante matriculado',
    },
  });

  await prisma.facturaCurso.create({
    data: {
      cursoPeriodoId: periodoBasicoMarzo.id,
      mes: 4, // April
      anio: 2025,
      montoTotal: 10000.00,
      fechaVencimiento: new Date('2025-04-30'),
      estado: 'PENDIENTE',
      observaciones: 'Factura de Abril - pendiente de pago',
    },
  });

  console.log(`✅ Course invoices created: 3 facturas`);

  console.log('\n🎉 Domain data seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- 2 Users (admin, preceptor)');
  console.log('- 2 Courses');
  console.log('- 2 Course periods');
  console.log('- 3 Students');
  console.log('- 3 Enrollments');
  console.log('- 3 Payments');
  console.log('- 3 Course invoices');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
