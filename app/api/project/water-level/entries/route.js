import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const project = await prisma.project.findUnique({
      where: { key: "water-level" }
    });
    const entries = await prisma.waterLevelEntry.findMany({
      where: { userId: user.id, projectId: project.id },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ entries });
  } catch (error) {
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch entries." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();
    const { levelPercent, projectId } = await request.json();
    if (
      typeof levelPercent !== "number" ||
      levelPercent < 0 ||
      levelPercent > 100
    ) {
      return NextResponse.json(
        { error: "Level percent must be between 0 and 100." },
        { status: 400 }
      );
    }

    const project =
      projectId ||
      (
        await prisma.project.findUnique({
          where: { key: "water-level" }
        })
      ).id;

    await prisma.waterLevelEntry.create({
      data: {
        userId: user.id,
        projectId: project,
        levelPercent,
        source: "MANUAL"
      }
    });

    const entries = await prisma.waterLevelEntry.findMany({
      where: { userId: user.id, projectId: project },
      orderBy: { createdAt: "desc" }
    });

    await prisma.userProject
      .update({
        where: { userId_projectId: { userId: user.id, projectId: project } },
        data: { status: "IN_PROGRESS", lastActivityAt: new Date() }
      })
      .catch(() => {});

    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create entry." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    const project = await prisma.project.findUnique({
      where: { key: "water-level" }
    });
    await prisma.waterLevelEntry.deleteMany({
      where: { userId: user.id, projectId: project.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete entries." },
      { status: 500 }
    );
  }
}