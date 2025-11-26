import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// Force dynamic rendering for API routes that use Prisma
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await requireUser();
    const { templateId } = await request.json();
    
    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required." },
        { status: 400 }
      );
    }
    
    // Check if user has an API key
    const existingConfig = await prisma.userApiConfig.findUnique({
      where: { userId: user.id }
    });
    
    if (!existingConfig) {
      return NextResponse.json(
        { error: "API key not found. Generate an API key first." },
        { status: 404 }
      );
    }
    
    // Update the template ID
    const config = await prisma.userApiConfig.update({
      where: { userId: user.id },
      data: { templateId }
    });
    
    return NextResponse.json({ config });
  } catch (error) {
    console.error(error);
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "API config not found. Generate a key first." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update template ID." },
      { status: 500 }
    );
  }
}