import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/auth";

export async function POST(request) {
  try {
    await requireAdmin();
    const { userId, projectId, status } = await request.json();
    if (!userId || !projectId || !status) {
      return NextResponse.json(
        { error: "userId, projectId and status are required." },
        { status: 400 }
      );
    }
    await prisma.userProject.update({
      where: { userId_projectId: { userId, projectId } },
      data: { status, lastActivityAt: new Date() }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to update project status." },
      { status: 500 }
    );
  }
}

