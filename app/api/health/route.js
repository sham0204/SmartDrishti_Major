import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// Force dynamic rendering for API routes that use Prisma
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Test a simple query
    const projects = await prisma.project.findMany({
      take: 1
    });
    
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      projectCount: projects.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}