import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
import { requireUser } from "../../lib/auth";
import ProfileClient from "../../components/profile/ProfileClient";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default async function ProfilePage({ searchParams }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login?from=/profile");
  }

  const waterCountPromise = prisma.waterLevelEntry.count({
    where: { userId: user.id }
  });
  const applianceCountPromise = prisma.applianceState.count({
    where: { userId: user.id }
  });
  const projectsPromise = prisma.userProject.findMany({
    where: { userId: user.id },
    include: { project: true },
    orderBy: { projectId: "asc" }
  });

  const [waterCount, applianceCount, userProjects] = await Promise.all([
    waterCountPromise,
    applianceCountPromise,
    projectsPromise
  ]);

  const completed = userProjects.filter((p) => p.status === "COMPLETED").length;
  const inProgress = userProjects.filter(
    (p) => p.status === "IN_PROGRESS"
  ).length;

  return (
    <ProfileClient
      user={user}
      userProjects={userProjects}
      stats={{ completed, inProgress, waterCount, applianceCount }}
      initialMode={{
        edit: searchParams?.edit === "1",
        changePassword: searchParams?.changePassword === "1"
      }}
    />
  );
}