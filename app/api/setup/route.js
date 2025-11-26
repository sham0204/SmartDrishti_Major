import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { execSync } from "child_process";
import { promisify } from "util";

const exec = promisify(execSync);

export async function POST() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to create tables using Prisma migrate
    try {
      const result = execSync('npx prisma migrate deploy', {
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 30000
      });
      
      return NextResponse.json({
        success: true,
        message: "Database tables created successfully",
        output: result.toString()
      });
    } catch (migrateError) {
      console.error("Migration error:", migrateError);
      
      // Try alternative approach with db push
      try {
        const pushResult = execSync('npx prisma db push --accept-data-loss', {
          cwd: process.cwd(),
          stdio: 'pipe',
          timeout: 30000
        });
        
        return NextResponse.json({
          success: true,
          message: "Database schema pushed successfully",
          output: pushResult.toString()
        });
      } catch (pushError) {
        console.error("Push error:", pushError);
        
        return NextResponse.json({
          success: false,
          error: "Failed to create database tables",
          migrateError: migrateError.message,
          pushError: pushError.message
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("Setup error:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`;
    
    // Check specifically for Project table
    const projectTable = tables.find(t => t.table_name === 'Project');
    
    return NextResponse.json({
      success: true,
      connected: true,
      tables: tables.map(t => t.table_name),
      projectTableExists: !!projectTable
    });
  } catch (error) {
    console.error("Database check error:", error);
    
    return NextResponse.json({
      success: false,
      connected: false,
      error: error.message
    }, { status: 500 });
  }
}