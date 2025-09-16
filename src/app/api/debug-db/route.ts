import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Debug DB: Starting database diagnostics...');
    
    // Test 1: Basic connection
    const connectionTest = await db.$queryRaw`SELECT 1 as test`;
    console.log('✅ Basic connection test passed:', connectionTest);
    
    // Test 2: List all tables in public schema
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('📋 Tables found:', tables);
    
    // Test 3: Check if users table exists (different variations)
    const userTableCheck = await db.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as users_exists;
    `;
    console.log('👤 Users table check:', userTableCheck);
    
    // Test 4: Check all schemas
    const schemas = await db.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      ORDER BY schema_name;
    `;
    console.log('📂 Schemas found:', schemas);
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      diagnostics: {
        connectionTest,
        tables,
        userTableCheck,
        schemas
      }
    });
    
  } catch (error) {
    console.error('❌ Debug DB failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
