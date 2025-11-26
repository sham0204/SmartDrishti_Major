import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/auth";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const userId = Number(params.id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json(
        { error: "Invalid user id." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const projects = await prisma.userProject.findMany({
      where: { userId },
      include: { project: true }
    });
    const waterCount = await prisma.waterLevelEntry.count({
      where: { userId }
    });
    const applianceCount = await prisma.applianceState.count({
      where: { userId }
    });

    return NextResponse.json({
      user,
      projects,
      waterCount,
      applianceCount
    });
  } catch (error) {
    console.error(error);
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to fetch user details." },
      { status: 500 }
    );
  }
}

