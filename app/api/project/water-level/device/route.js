import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { apiKey, templateId, levelPercent, timestamp } = await request.json();
    if (!apiKey || typeof levelPercent !== "number") {
      return NextResponse.json(
        { error: "apiKey and levelPercent are required." },
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
      where: { key: "water-level" }
    });

    await prisma.waterLevelEntry.create({
      data: {
        userId: config.userId,
        projectId: project.id,
        levelPercent,
        source: "DEVICE",
        createdAt: timestamp ? new Date(timestamp) : undefined
      }
    });

    await prisma.userProject
      .update({
        where: {
          userId_projectId: { userId: config.userId, projectId: project.id }
        },
        data: { status: "IN_PROGRESS", lastActivityAt: new Date() }
      })
      .catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to record water level." },
      { status: 500 }
    );
  }
}

