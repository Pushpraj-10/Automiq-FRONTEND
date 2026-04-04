"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Workflow,
  Activity,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { fetchCurrentUser } from "@/state/slices/users.slice";
import { logout } from "@/state/slices/auth.slice";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/executions", label: "Executions", icon: Activity },
  { href: "/events", label: "Events", icon: Zap },
  { href: "/settings/profile", label: "Settings", icon: Settings },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.users.current);
  const userStatus = useAppSelector((s) => s.users.status);

  // Auth guard — redirect to login if no token
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  // Fetch current user on mount if we have a token but no user
  useEffect(() => {
    if (token && !user && userStatus === "idle") {
      dispatch(fetchCurrentUser());
    }
  }, [token, user, userStatus, dispatch]);

  // Show nothing while redirecting
  if (!token) return null;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "..";

  return (
    <div className="min-h-screen bg-black text-neutral-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col transition-all">
        <div className="h-16 flex items-center px-6 border-b border-neutral-800">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Automiq
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-blue-600/10 text-blue-400"
                      : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                {initials}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name || "Loading…"}</span>
              <span className="text-xs text-neutral-500">{user?.email || ""}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md flex items-center px-6 justify-between flex-shrink-0">
          <div className="text-sm text-neutral-400 font-medium capitalize">
            {pathname?.split("/").filter(Boolean).join(" / ") || "Dashboard"}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden sm:flex border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800">
              Documentation
            </Button>
            <Link href="/workflows">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                New Workflow
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-neutral-950 p-6 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
