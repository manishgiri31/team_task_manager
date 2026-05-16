"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, initialized, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <Spinner className="h-10 w-10" />
    </div>
  );
}
