"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useAuth } from "../../lib/hooks";
import Button from "./Button";
import Input from "./Input";
import Alert from "./Alert";
import LoadingSpinner from "./LoadingSpinner";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";
  const registered = searchParams.get("registered");

  const { user, loading, error, login } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect
    if (user) {
      router.push(redirectTo);
    }
  }, [user, router, redirectTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      await login({ username, password });
      router.push(redirectTo);
    } catch (err) {
      // Error is handled by the hook, we just need to let the UI render it
    }
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md card p-6 md:p-8">
      <h1 className="mb-2 text-xl font-semibold">Login</h1>
      <p className="mb-4 text-xs text-slate-400">
        Use one of the predefined credentials from the landing page.
      </p>

      {registered && (
        <Alert variant="success" className="mb-4">
          Registration successful! Please log in with your new credentials.
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Username"
          name="username"
          placeholder="e.g. user1"
          required
        />
        
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="sm" className="mr-2" />
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </Button>
      </form>

      <div className="mt-4 text-xs text-slate-400">
        Don&#39;t have an account?{" "}
        <Link href="/register" className="text-sky-300 underline">
          Register here
        </Link>
        .
      </div>
    </div>
  );
}

// Wrapper component that provides the Suspense boundary
export function LoginFormWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <LoginForm />
    </Suspense>
  );
}