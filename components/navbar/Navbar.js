"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../lib/hooks";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, checkAuth, logout } = useAuth();

  useEffect(() => {
    // Check auth status on mount and when pathname changes
    checkAuth();
  }, [checkAuth, pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      // Even if logout fails, redirect to homepage
      router.push("/");
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <nav className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 via-purple-500 to-emerald-500" />
          <div>
            <div className="text-lg font-semibold tracking-tight">
              SmartDrishti
            </div>
            <div className="text-xs text-slate-400">
              Learn IoT with confidence
            </div>
          </div>
        </Link>

        {loading ? (
          <div className="flex items-center gap-3">
            <LoadingSpinner size="sm" />
          </div>
        ) : !user ? (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="ghost" size="sm">
                Register
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/projects/water-level" className="hidden sm:inline">
              <Button variant="secondary" size="sm">
                Water Level
              </Button>
            </Link>
            <Link href="/projects/home-appliances" className="hidden sm:inline">
              <Button variant="secondary" size="sm">
                Home Appliances
              </Button>
            </Link>
            {user.role === "ADMIN" && (
              <Link href="/admin" className="hidden md:inline">
                <Button variant="secondary" size="sm">
                  Admin
                </Button>
              </Link>
            )}
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs">
                <span className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-500 to-purple-500" />
                <span className="hidden text-slate-100 sm:inline">
                  {user.username}
                </span>
              </button>
              <div className="absolute right-0 mt-2 hidden w-52 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 text-sm shadow-2xl group-hover:block">
                <Link
                  href="/profile"
                  className="block rounded-xl px-3 py-2 text-slate-100 hover:bg-slate-800/80"
                >
                  View Profile
                </Link>
                <Link
                  href="/profile?edit=1"
                  className="block rounded-xl px-3 py-2 text-slate-100 hover:bg-slate-800/80"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/profile?changePassword=1"
                  className="block rounded-xl px-3 py-2 text-slate-100 hover:bg-slate-800/80"
                >
                  Change Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-1 w-full rounded-xl px-3 py-2 text-left text-red-400 hover:bg-red-500/10"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}