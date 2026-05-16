"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getApiErrorMessage } from "@/services/api";

export default function SignupPage() {
  const { signup, user, initialized } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
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
      await signup({ name, email, password });
      showToast("Account created", "success");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/25 via-slate-950 to-slate-950" />
      <Card className="relative w-full max-w-md border-slate-800/80 p-8">
        <h1 className="text-xl font-semibold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-slate-400">
          New users register as members. Admins can promote roles in the database.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              id="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-medium text-indigo-400 hover:text-indigo-300" href="/login">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
