"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/hooks";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Alert from "../../../components/ui/Alert";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

export default function RegisterPage() {
  const router = useRouter();
  const { loading, error, register } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get("name");
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await register({ name, username, email, password });
      router.push("/login?registered=true");
    } catch (err) {
      // Error is handled by the hook, we just need to let the UI render it
    }
  };

  return (
    <div className="mx-auto max-w-md card p-6 md:p-8">
      <h1 className="mb-2 text-xl font-semibold">Register</h1>
      <p className="mb-4 text-xs text-slate-400">
        Create a new account to access the platform.
      </p>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          name="name"
          placeholder="e.g. John Doe"
          required
        />
        
        <Input
          label="Username"
          name="username"
          placeholder="e.g. johndoe"
          required
        />
        
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="e.g. john@example.com"
          required
        />
        
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
        
        <Input
          label="Confirm Password"
          name="confirmPassword"
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
              Creating account...
            </span>
          ) : (
            "Register"
          )}
        </Button>
      </form>

      <div className="mt-4 text-xs text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-sky-300 underline">
          Log in here
        </Link>
        .
      </div>
    </div>
  );
}