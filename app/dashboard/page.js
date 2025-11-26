import { redirect } from "next/navigation";
import { requireUser } from "../../lib/auth";
import prisma from "../../lib/prisma";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const user = await requireUser();
  } catch {
    redirect("/login?from=/dashboard");
  }

  const projects = await prisma.project.findMany({
    orderBy: { id: "asc" }
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here&#39;s what&#39;s happening with your projects.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Your Projects</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="card group p-5 transition hover:border-sky-500/70 hover:shadow-sky-500/30"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-slate-50">{project.title}</h3>
                <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 via-purple-500 to-emerald-500 transition-transform group-hover:scale-105" />
              </div>
              <p className="text-sm text-slate-300">{project.shortDescription}</p>
              <div className="mt-3 text-xs text-sky-300">
                Click to view project details and start the lab.
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}