const { execSync } = require('child_process');

console.log('🚀 Railway initialization started...');

try {
  // 1. Deploy migrations
  console.log('📦 Deploying database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations deployed successfully');

  // 2. Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  // 3. Seed database (only if tables are empty)
  console.log('🌱 Checking if database needs seeding...');
  
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  const userCount = await prisma.user.count();
  
  if (userCount === 0) {
    console.log('🌱 Seeding database...');
    execSync('node scripts/create-test-user.js', { stdio: 'inherit' });
    execSync('node scripts/seed-domain-data.js', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully');
  } else {
    console.log('✅ Database already has data, skipping seed');
  }
  
  await prisma.$disconnect();
  
  console.log('🎉 Railway initialization completed successfully!');
  
} catch (error) {
  console.error('❌ Railway initialization failed:', error);
  process.exit(1);
}
