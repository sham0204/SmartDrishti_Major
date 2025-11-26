import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

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