import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
import { requireAdmin } from "../../lib/auth";
import AdminClient from "../../components/admin/AdminClient";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/login?from=/admin");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  const firstUser = users[0];
  let userDetail = null;
  if (firstUser) {
    const projects = await prisma.userProject.findMany({
      where: { userId: firstUser.id },
      include: { project: true }
    });
    const waterCount = await prisma.waterLevelEntry.count({
      where: { userId: firstUser.id }
    });
    const applianceCount = await prisma.applianceState.count({
      where: { userId: firstUser.id }
    });
    userDetail = {
      user: firstUser,
      projects,
      waterCount,
      applianceCount
    };
  }

  const waterProject = await prisma.project.findUnique({
    where: { key: "water-level" }
  });
  const homeProject = await prisma.project.findUnique({
    where: { key: "home-appliances" }
  });

  const waterCompleted = await prisma.userProject.count({
    where: { projectId: waterProject.id, status: "COMPLETED" }
  });
  const waterTotal = await prisma.userProject.count({
    where: { projectId: waterProject.id }
  });

  const homeCompleted = await prisma.userProject.count({
    where: { projectId: homeProject.id, status: "COMPLETED" }
  });
  const homeTotal = await prisma.userProject.count({
    where: { projectId: homeProject.id }
  });

  const initial = {
    users,
    userDetail,
    projectStats: {
      "water-level": {
        completed: waterCompleted,
        notCompleted: Math.max(waterTotal - waterCompleted, 0)
      },
      "home-appliances": {
        completed: homeCompleted,
        notCompleted: Math.max(homeTotal - homeCompleted, 0)
      }
    }
  };

  return <AdminClient initial={initial} />;
}