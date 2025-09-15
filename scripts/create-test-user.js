const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@cfp.edu.ar' },
      update: {},
      create: {
        email: 'admin@cfp.edu.ar',
        password: hashedPassword,
        name: 'Administrador CFP',
        role: 'ADMIN',
        isActive: true,
      },
    });

    // Create preceptor user
    const preceptorPassword = await bcrypt.hash('preceptor123', 12);
    const preceptorUser = await prisma.user.upsert({
      where: { email: 'preceptor@cfp.edu.ar' },
      update: {},
      create: {
        email: 'preceptor@cfp.edu.ar',
        password: preceptorPassword,
        name: 'María González',
        role: 'PRECEPTOR',
        isActive: true,
      },
    });

    console.log('✅ Test users created successfully:');
    console.log('📧 Admin: admin@cfp.edu.ar / admin123');
    console.log('📧 Preceptor: preceptor@cfp.edu.ar / preceptor123');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
