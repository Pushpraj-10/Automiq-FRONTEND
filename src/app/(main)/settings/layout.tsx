"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Tabs = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/api-keys", label: "API Keys" },
  { href: "/settings/billing", label: "Billing" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0e0e0e]/90 p-6 md:p-8">
        <div className="pointer-events-none absolute -top-20 right-0 h-52 w-52 rounded-full bg-[#FACC15]/10 blur-3xl" />
        <h1 className="text-[32px] leading-tight font-extrabold tracking-[-1px] text-white">Settings</h1>
        <p className="mt-2 text-[15px] font-medium text-[#a0a0a0]">Manage your account settings and workspace preferences.</p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0e0e0e]/80 p-2">
        <div className="flex flex-wrap items-center gap-2">
          {Tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
                  isActive
                    ? "bg-[#FACC15]/10 text-yellow-400 border border-yellow-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "border border-transparent text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <section className="w-full min-w-0">{children}</section>
    </div>
  );
}
