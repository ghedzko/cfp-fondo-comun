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
  
  const cursoBasico = await prisma.course.create({
    data: {
      name: 'Curso Básico de Computación',
      description: 'Introducción a la informática y herramientas básicas de oficina',
      duration: 3, // 3 months
      price: 15000.00,
      isActive: true,
    },
  });

  const cursoAvanzado = await prisma.course.create({
    data: {
      name: 'Curso Avanzado de Programación',
      description: 'Desarrollo web con tecnologías modernas',
      duration: 6, // 6 months
      price: 25000.00,
      isActive: true,
    },
  });

  console.log(`✅ Courses created: ${cursoBasico.name}, ${cursoAvanzado.name}`);

  // 3. Create course periods
  console.log('📅 Creating course periods...');
  
  const periodoBasicoMarzo = await prisma.coursePeriod.create({
    data: {
      courseId: cursoBasico.id,
      name: 'Curso Básico - Marzo 2025',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-05-31'),
      monthlyPrice: 5000.00,
      enabledMonths: [3, 4, 5],
      year: 2025,
      isActive: true,
    },
  });

  const periodoAvanzadoAbril = await prisma.coursePeriod.create({
    data: {
      courseId: cursoAvanzado.id,
      name: 'Curso Avanzado - Abril 2025',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-09-30'),
      monthlyPrice: 4200.00,
      enabledMonths: [4, 5, 6, 7, 8, 9],
      year: 2025,
      isActive: true,
    },
  });

  console.log(`✅ Course periods created: ${periodoBasicoMarzo.name}, ${periodoAvanzadoAbril.name}`);

  // 4. Create students
  console.log('👨‍🎓 Creating students...');
  
  const estudiante1 = await prisma.student.create({
    data: {
      dni: '12345678',
      firstName: 'Juan Carlos',
      lastName: 'González',
      email: 'juan.gonzalez@email.com',
      phone: '+54 294 123-4567',
      address: 'Av. San Martín 123, Lago Puelo',
      birthDate: new Date('1995-06-15'),
      isActive: true,
    },
  });

  const estudiante2 = await prisma.student.create({
    data: {
      dni: '87654321',
      firstName: 'María Elena',
      lastName: 'Rodríguez',
      email: 'maria.rodriguez@email.com',
      phone: '+54 294 987-6543',
      address: 'Calle Rivadavia 456, Lago Puelo',
      birthDate: new Date('1988-11-22'),
      isActive: true,
    },
  });

  const estudiante3 = await prisma.student.create({
    data: {
      dni: '11223344',
      firstName: 'Carlos Alberto',
      lastName: 'Fernández',
      email: 'carlos.fernandez@email.com',
      phone: '+54 294 555-1234',
      address: 'Barrio Centro, Lago Puelo',
      birthDate: new Date('1992-03-08'),
      isActive: true,
    },
  });

  console.log(`✅ Students created: ${estudiante1.firstName} ${estudiante1.lastName}, ${estudiante2.firstName} ${estudiante2.lastName}, ${estudiante3.firstName} ${estudiante3.lastName}`);

  // 5. Create enrollments (matriculas)
  console.log('📝 Creating enrollments...');
  
  const matricula1 = await prisma.enrollment.create({
    data: {
      studentId: estudiante1.id,
      coursePeriodId: periodoBasicoMarzo.id,
      enrollmentDate: new Date('2025-02-15'),
      status: 'ACTIVE',
      notes: 'Estudiante muy interesado en aprender',
    },
  });

  const matricula2 = await prisma.enrollment.create({
    data: {
      studentId: estudiante2.id,
      coursePeriodId: periodoAvanzadoAbril.id,
      enrollmentDate: new Date('2025-03-20'),
      status: 'ACTIVE',
      notes: 'Tiene experiencia previa en programación',
    },
  });

  const matricula3 = await prisma.enrollment.create({
    data: {
      studentId: estudiante3.id,
      coursePeriodId: periodoBasicoMarzo.id,
      enrollmentDate: new Date('2025-02-28'),
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Enrollments created: 3 matriculas`);

  // 6. Create payments (aportes)
  console.log('💰 Creating payments...');
  
  await prisma.contribution.create({
    data: {
      studentId: estudiante1.id,
      coursePeriodId: periodoBasicoMarzo.id,
      month: 3,
      year: 2025,
      amount: 5000.00,
      concept: 'Cuota mensual Marzo 2025',
      paymentDate: new Date('2025-03-05'),
      paymentMethod: 'CASH',
      receipt: 'REC-001',
      notes: 'Pago puntual',
    },
  });

  await prisma.contribution.create({
    data: {
      studentId: estudiante2.id,
      coursePeriodId: periodoAvanzadoAbril.id,
      month: 4,
      year: 2025,
      amount: 4200.00,
      concept: 'Cuota mensual Abril 2025',
      paymentDate: new Date('2025-04-10'),
      paymentMethod: 'TRANSFER',
      receipt: 'TRANS-123456',
    },
  });

  await prisma.contribution.create({
    data: {
      studentId: estudiante3.id,
      coursePeriodId: periodoBasicoMarzo.id,
      month: 3,
      year: 2025,
      amount: 2500.00,
      concept: 'Pago parcial Marzo 2025',
      paymentDate: new Date('2025-03-15'),
      paymentMethod: 'CASH',
      receipt: 'REC-002',
      notes: 'Pago parcial - resta $2500',
    },
  });

  console.log(`✅ Payments created: 3 aportes`);

  // 7. Create course invoices (facturas)
  console.log('🧾 Creating course invoices...');
  
  await prisma.courseInvoice.create({
    data: {
      coursePeriodId: periodoBasicoMarzo.id,
      month: 3, // March
      year: 2025,
      totalAmount: 10000.00, // 2 students x $5000
      dueDate: new Date('2025-03-31'),
      status: 'PAID',
      notes: 'Factura de Marzo - 2 estudiantes matriculados',
    },
  });

  await prisma.courseInvoice.create({
    data: {
      coursePeriodId: periodoAvanzadoAbril.id,
      month: 4, // April
      year: 2025,
      totalAmount: 4200.00, // 1 student x $4200
      dueDate: new Date('2025-04-30'),
      status: 'PAID',
      notes: 'Factura de Abril - 1 estudiante matriculado',
    },
  });

  await prisma.courseInvoice.create({
    data: {
      coursePeriodId: periodoBasicoMarzo.id,
      month: 4, // April
      year: 2025,
      totalAmount: 10000.00,
      dueDate: new Date('2025-04-30'),
      status: 'PENDING',
      notes: 'Factura de Abril - pendiente de pago',
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
