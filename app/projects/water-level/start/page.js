import { redirect } from "next/navigation";
import WaterLevelClient from "../../../../components/ui/WaterLevelClient";
import prisma from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/auth";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default async function WaterLevelStartPage() {
  // 1. Retrieve and guard user (redirect to login if unauthenticated)
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login?from=/projects/water-level/start");
  }

  // 2. Fetch project and validate it exists
  const project = await prisma.project.findUnique({
    where: { key: "water-level" }
  });

  // If project doesn't exist, show a friendly error message
  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card max-w-md p-6 text-center">
          <h1 className="mb-4 text-xl font-bold">Project Not Found</h1>
          <p className="mb-4 text-slate-300">
            The Water Level project could not be found. Please contact an administrator.
          </p>
          <a 
            href="/dashboard" 
            className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // 3. Fetch water level entries and API config using user.id and project.id
  const [apiConfig, entries] = await Promise.all([
    prisma.userApiConfig.findUnique({ where: { userId: user.id } }),
    prisma.waterLevelEntry.findMany({
      where: { 
        userId: user.id, 
        projectId: project.id 
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  // Update user project status (ignore errors)
  await prisma.userProject
    .update({
      where: { userId_projectId: { userId: user.id, projectId: project.id } },
      data: { status: "IN_PROGRESS", lastActivityAt: new Date() }
    })
    .catch(() => {});

  // 4. Return JSX rendering with project info and data
  return (
    <WaterLevelClient
      projectId={project.id}
      initialData={{ apiConfig, entries }}
    />
  );
}