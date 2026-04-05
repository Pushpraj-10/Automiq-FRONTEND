"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { logout } from "@/state/slices/auth.slice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.users.current);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "..";

  const handleSignOut = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch {
      // Even if server logout fails, clear local state
    }
    router.push("/login");
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="bg-[#0e0e0e]/90 border-white/5 text-white shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Profile Details</CardTitle>
            <CardDescription className="text-[#a0a0a0] font-medium">
            Your personal information is managed by your Identity Provider (Google).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-white/5 bg-black/20 p-5">
              <div className="flex items-center space-x-4">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name || "User"}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-linear-to-tr from-[#FACC15] to-[#f59e0b] flex items-center justify-center text-xl font-black text-black shadow-[0_8px_24px_rgba(250,204,21,0.18)]">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="font-bold text-lg text-white">{user?.name || "Loading..."}</div>
                  <div className="text-[#a0a0a0] text-sm font-medium">{user?.email || ""}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-300">Display Name</label>
                <Input disabled value={user?.name || ""} className="bg-[#0a0a0a] border-white/10 text-neutral-300" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-300">Email Address</label>
                <Input disabled value={user?.email || ""} className="bg-[#0a0a0a] border-white/10 text-neutral-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0e0e0e]/90 border-white/5 text-white shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Session & Access</CardTitle>
            <CardDescription className="text-[#a0a0a0] font-medium">Manage how this workspace session is authenticated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <ShieldCheck className="w-4 h-4" /> Connected with Google OAuth
              </div>
              <p className="mt-2 text-xs text-emerald-300/70 font-medium">Your identity provider controls password and profile security settings.</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[1.2px] text-neutral-500 font-extrabold">Current Account</p>
              <p className="mt-2 text-sm font-semibold text-white break-all">{user?.email || "No email available"}</p>
            </div>

            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 border border-red-500/30 font-bold"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
