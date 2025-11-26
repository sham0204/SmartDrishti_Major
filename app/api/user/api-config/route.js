import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/auth";

// Force dynamic rendering for API routes that use Prisma
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const config = await prisma.userApiConfig.findUnique({
      where: { userId: user.id }
    });
    return NextResponse.json({ config });
  } catch (error) {
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to load API config." },
      { status: 500 }
    );
  }
}

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

    const apiKey = crypto.randomUUID();

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
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "API key already exists. Try again." },
        { status: 400 }
      );
    }
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create API config." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await requireUser();
    const { templateId } = await request.json();
    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required." },
        { status: 400 }
      );
    }

    const config = await prisma.userApiConfig.update({
      where: { userId: user.id },
      data: { templateId }
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "API config not found. Generate a key first." },
        { status: 404 }
      );
    }
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update template ID." },
      { status: 500 }
    );
  }
}