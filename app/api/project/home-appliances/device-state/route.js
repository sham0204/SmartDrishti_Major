import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { apiKey, templateId, led1, led2, fan1, timestamp } =
      await request.json();
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

    if (
      typeof led1 !== "boolean" ||
      typeof led2 !== "boolean" ||
      typeof fan1 !== "boolean"
    ) {
      return NextResponse.json(
        { error: "led1, led2 and fan1 must be booleans." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { key: "home-appliances" }
    });

    await prisma.applianceState.create({
      data: {
        userId: config.userId,
        projectId: project.id,
        led1,
        led2,
        fan1,
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
      { error: "Failed to record appliance state." },
      { status: 500 }
    );
  }
}