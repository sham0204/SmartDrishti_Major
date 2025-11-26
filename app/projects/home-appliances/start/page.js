import { redirect } from "next/navigation";
import HomeAppliancesClient from "../../../../components/ui/HomeAppliancesClient";
import prisma from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/auth";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default async function HomeAppliancesStartPage() {
  // 1. Retrieve and guard user (redirect to login if unauthenticated)
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login?from=/projects/home-appliances/start");
  }

  // 2. Fetch project and validate it exists
  const project = await prisma.project.findUnique({
    where: { key: "home-appliances" }
  });

  // If project doesn't exist, show a friendly error message
  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card max-w-md p-6 text-center">
          <h1 className="mb-4 text-xl font-bold">Project Not Found</h1>
          <p className="mb-4 text-slate-300">
            The Home Appliances project could not be found. Please contact an administrator.
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

  // 3. Fetch appliance state history and API config using user.id and project.id
  const [apiConfig, history] = await Promise.all([
    prisma.userApiConfig.findUnique({ where: { userId: user.id } }),
    prisma.applianceState.findMany({
      where: { 
        userId: user.id, 
        projectId: project.id 
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const latest = history[0] || { led1: false, led2: false, fan1: false };

  // Update user project status (ignore errors)
  await prisma.userProject
    .update({
      where: { userId_projectId: { userId: user.id, projectId: project.id } },
      data: { status: "IN_PROGRESS", lastActivityAt: new Date() }
    })
    .catch(() => {});

  // 4. Return JSX rendering with project info and history
  return (
    <HomeAppliancesClient
      initialState={{ led1: latest.led1, led2: latest.led2, fan1: latest.fan1 }}
      history={history}
      projectId={project.id}
      apiConfig={apiConfig}
    />
  );
}