"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950/90">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          TM
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Team Tasks</p>
          <p className="text-xs text-slate-500">Task Manager</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main navigation">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-indigo-600/20 text-indigo-200 ring-1 ring-indigo-500/40"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <p className="truncate text-sm font-medium text-slate-200">{user?.name}</p>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
        <span className="mt-2 inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-xs capitalize text-slate-300">
          {user?.role}
          {isAdmin ? " · full access" : ""}
        </span>
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="mt-4 w-full rounded-lg border border-slate-700 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
