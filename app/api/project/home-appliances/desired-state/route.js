import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Force dynamic rendering for API routes that use Prisma
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("apiKey");
    const templateId = searchParams.get("templateId");
    if (!apiKey) {
      return NextResponse.json(
        { error: "apiKey is required." },
        { status: 400 }
      );
    }

    const config = await prisma.userApiConfig.findUnique({
      where: { apiKey }
    });
    if (!config) {
      return NextResponse.json({ error: "Invalid apiKey." }, { status: 401 });
    }
    if (templateId && templateId !== config.templateId) {
      return NextResponse.json(
        { error: "templateId mismatch." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { key: "home-appliances" }
    });

    const latest = await prisma.applianceState.findFirst({
      where: { userId: config.userId, projectId: project.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      led1: latest?.led1 ?? false,
      led2: latest?.led2 ?? false,
      fan1: latest?.fan1 ?? false
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch desired state." },
      { status: 500 }
    );
  }
}