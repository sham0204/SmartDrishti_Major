import Link from "next/link";
import prisma from "../lib/prisma";
import { getCurrentUser } from "../lib/auth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

// Force dynamic rendering to prevent Prisma client issues during build
export const dynamic = "force-dynamic";

const DEMO_USERS = [
  { username: "admin", password: "admin123", role: "ADMIN" },
  { username: "user1", password: "user123", role: "USER" },
  { username: "user2", password: "user123", role: "USER" },
  { username: "user3", password: "user123", role: "USER" },
  { username: "user4", password: "user123", role: "USER" },
  { username: "user5", password: "user123", role: "USER" }
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const projects = await prisma.project.findMany({
    orderBy: { id: "asc" }
  });

  return (
    <div className="space-y-8">
      <section className="card relative overflow-hidden p-6 md:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-purple-500/10 to-emerald-500/20 opacity-40" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              SmartDrishti
            </h1>
            <p className="max-w-xl text-sm text-slate-300 md:text-base">
              SmartDrishti is a hands-on IoT learning platform featuring two
              guided projects: a{" "}
              <span className="font-semibold text-sky-300">Water Level Detector</span>{" "}
              and a{" "}
              <span className="font-semibold text-emerald-300">
                Home Appliances Monitoring System
              </span>
              . Learn sensors, actuators, cloud APIs, and dashboards in one friendly
              environment.
            </p>
            <div className="flex flex-wrap gap-3 text-xs md:text-sm">
              <span className="rounded-full border border-sky-500/40 bg-sky-500/20 px-3 py-1 text-sky-100">
                IoT Fundamentals
              </span>
              <span className="rounded-full border border-purple-500/40 bg-purple-500/20 px-3 py-1 text-purple-100">
                ESP32 / Arduino Ready
              </span>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-emerald-100">
                Realtime Dashboards
              </span>
            </div>
          </div>

          {!user && (
            <Card className="mt-6 w-full border-sky-500/40 p-4 md:mt-0 md:w-80">
              <h2 className="mb-2 text-sm font-semibold text-sky-100">
                Demo Credentials
              </h2>
              <p className="mb-3 text-xs text-slate-400">
                Registration is disabled. Use one of the demo accounts below to log in.
              </p>
              <div className="max-h-56 space-y-1 overflow-y-auto text-xs">
                {DEMO_USERS.map((u) => (
                  <div
                    key={u.username}
                    className="flex justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-2 py-1.5"
                  >
                    <div>
                      <div className="font-mono text-slate-100">{u.username}</div>
                      <div className="font-mono text-slate-400">pwd: {u.password}</div>
                    </div>
                    <span className="self-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="mt-3 w-full text-center">
                <Button className="w-full">
                  Go to Login
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </section>

      {user && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.key}`}
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
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}