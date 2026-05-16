"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getApiErrorMessage } from "@/services/api";

function LoginForm() {
  const { login, user, initialized } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialized || !user) return;
    router.replace("/dashboard");
  }, [initialized, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      showToast("Signed in successfully", "success");
      const next = searchParams.get("from");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-slate-800/80 p-8">
      <h1 className="text-xl font-semibold text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-400">
        Sign in to manage projects and tasks.
      </p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        No account?{" "}
        <Link className="font-medium text-indigo-400 hover:text-indigo-300" href="/signup">
          Create one
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/25 via-slate-950 to-slate-950" />
      <Suspense
        fallback={
          <Card className="relative w-full max-w-md p-8 text-center text-slate-400">
            Loading…
          </Card>
        }
      >
        <div className="relative w-full max-w-md">
          <LoginForm />
        </div>
      </Suspense>
    </div>
  );
}
