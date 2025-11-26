import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// Force dynamic rendering for API routes that use Prisma
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await requireUser();
    
    // Check if user already has an API key
    const existingConfig = await prisma.userApiConfig.findUnique({
      where: { userId: user.id }
    });
    
    if (existingConfig) {
      return NextResponse.json(
        { error: "API key already exists. Use the existing one or update template ID." },
        { status: 400 }
      );
    }
    
    // Get the home appliances project
    const project = await prisma.project.findUnique({
      where: { key: "home-appliances" }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: "Home Appliances project not found." },
        { status: 500 }
      );
    }
    
    // Generate a new API key and default template ID
    const apiKey = crypto.randomUUID();
    const templateId = `TPL-HA-${user.id}`;
    
    // Create the API config
    const config = await prisma.userApiConfig.create({
      data: {
        userId: user.id,
        apiKey,
        templateId
      }
    });
    
    return NextResponse.json({ config });
  } catch (error) {
    console.error(error);
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to generate API key." },
      { status: 500 }
    );
  }
}