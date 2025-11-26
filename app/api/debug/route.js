import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to query projects
    const projects = await prisma.project.findMany();
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      projectCount: projects.length,
      projects: projects
    });
  } catch (error) {
    console.error("Database error:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      meta: error.meta
    }, { status: 500 });
  }
}