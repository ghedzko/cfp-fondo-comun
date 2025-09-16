import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection with a simple query
    await db.$queryRaw`SELECT 1 as test`;
    
    // Get basic database stats
    const userCount = await db.user.count();
    const studentCount = await db.student.count();
    const courseCount = await db.course.count();
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        responseTime: `${responseTime}ms`,
        stats: {
          users: userCount,
          students: studentCount,
          courses: courseCount
        }
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
          responseTime: `${responseTime}ms`,
          error: error instanceof Error ? error.message : 'Database connection failed'
        },
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      },
      { status: 503 }
    );
  }
}
