import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/auth";

export async function POST(request) {
  try {
    await requireAdmin();
    const { userId, newPassword } = await request.json();
    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "userId and newPassword are required." },
        { status: 400 }
      );
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
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
      { error: "Failed to change password." },
      { status: 500 }
    );
  }
}

