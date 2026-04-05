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
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const user = useAppSelector((s) => s.users.current);
  const userStatus = useAppSelector((s) => s.users.status);
  const isWorkflowEditorPage = Boolean(pathname?.match(/^\/workflows\/[^/]+$/));

  // Auth guard — redirect to login if no token
  useEffect(() => {
    if (hydrated && !token) {
      router.push("/login");
    }
  }, [token, hydrated, router]);

  // Fetch current user on mount if we have a token but no user
  useEffect(() => {
    if (token && !user && userStatus === "idle") {
      dispatch(fetchCurrentUser());
    }
  }, [token, user, userStatus, dispatch]);

  // Show nothing while redirecting
  if (!hydrated || !token) return null;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "..";

  if (isWorkflowEditorPage) {
    return (
      <div className="h-screen bg-[#050505] text-neutral-100 selection:bg-[#FACC15] selection:text-black">
        <main className="h-full w-full overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-50 flex selection:bg-[#FACC15] selection:text-black">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col transition-all relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2 font-extrabold text-xl text-white">
            <Zap size={20} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            <span>Automiq</span>
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer",
                    isActive
                      ? "bg-[#FACC15]/10 text-yellow-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-yellow-400/20"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FACC15] to-[#f59e0b] flex items-center justify-center text-xs font-black text-black shadow-[0_2px_10px_rgba(250,204,21,0.2)]">
                {initials}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold">{user?.name || "Loading…"}</span>
              <span className="text-[11px] text-neutral-500 font-medium">{user?.email || ""}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center px-6 justify-between flex-shrink-0 relative z-20">
          <div className="text-[13px] text-neutral-400 font-bold capitalize tracking-[1px]">
            {pathname?.split("/").filter(Boolean).join(" / ") || "Dashboard"}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/workflows">
              <Button size="sm" className="bg-[#FACC15] hover:bg-yellow-500 text-black rounded-full font-extrabold text-xs px-5 border-none shadow-[0_5px_15px_rgba(250,204,21,0.25)] hover:-translate-y-[1px] transition-all">
                New Workflow
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-transparent p-6 relative">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_256_256%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter_id=%27noise%27%3E%3CfeTurbulence_type=%27fractalNoise%27_baseFrequency=%270.9%27_numOctaves=%274%27_stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect_width=%27100%25%27_height=%27100%25%27_filter=%27url(%23noise)%27/%3E%3C/svg%3E')]" />
          <div className="absolute inset-0 w-full text-center bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,black_30%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,black_30%,transparent_100%)] z-0" />
          
          <div className="max-w-[1400px] mx-auto relative z-10 w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
