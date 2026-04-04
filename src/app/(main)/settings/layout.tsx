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
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="text-neutral-400">Manage your account settings and preferences.</p>
      </div>

      <div className="flex items-center space-x-2 border-b border-neutral-800 pb-px">
        {Tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                isActive
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="max-w-2xl">{children}</div>
    </div>
  );
}
