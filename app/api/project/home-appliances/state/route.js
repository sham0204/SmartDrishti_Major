import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// Force dynamic rendering for API routes that use Prisma
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const project = await prisma.project.findUnique({
      where: { key: "home-appliances" }
    });
    const history = await prisma.applianceState.findMany({
      where: { userId: user.id, projectId: project.id },
      orderBy: { createdAt: "desc" }
    });
    const latest = history[0] || { led1: false, led2: false, fan1: false };
    return NextResponse.json({
      current: { led1: latest.led1, led2: latest.led2, fan1: latest.fan1 },
      history
    });
  } catch (error) {
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch appliance state." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();
    const { led1, led2, fan1, projectId } = await request.json();
    if (
      typeof led1 !== "boolean" ||
      typeof led2 !== "boolean" ||
      typeof fan1 !== "boolean"
    ) {
      return NextResponse.json(
        { error: "LED/Fan values must be boolean." },
        { status: 400 }
      );
    }

    const project =
      projectId ||
      (
        await prisma.project.findUnique({
          where: { key: "home-appliances" }
        })
      ).id;

    await prisma.applianceState.create({
      data: {
        userId: user.id,
        projectId: project,
        led1,
        led2,
        fan1,
        source: "WEB"
      }
    });

    const history = await prisma.applianceState.findMany({
      where: { userId: user.id, projectId: project },
      orderBy: { createdAt: "desc" }
    });

    await prisma.userProject
      .update({
        where: { userId_projectId: { userId: user.id, projectId: project } },
        data: { status: "IN_PROGRESS", lastActivityAt: new Date() }
      })
      .catch(() => {});

    return NextResponse.json({ history });
  } catch (error) {
    console.error(error);
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update state." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    const project = await prisma.project.findUnique({
      where: { key: "home-appliances" }
    });
    await prisma.applianceState.deleteMany({
      where: { userId: user.id, projectId: project.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete history." },
      { status: 500 }
    );
  }
}