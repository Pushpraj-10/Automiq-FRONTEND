"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
    <div className="space-y-6">
      <Card className="bg-neutral-900 border-neutral-800 text-white">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription className="text-neutral-400">
            Your personal information is managed by your Identity Provider (Google).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name || "User"}
                className="w-16 h-16 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {initials}
              </div>
            )}
            <div>
              <div className="font-semibold text-lg">{user?.name || "Loading…"}</div>
              <div className="text-neutral-500 text-sm">{user?.email || ""}</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Display Name</label>
            <Input disabled value={user?.name || ""} className="bg-neutral-950 border-neutral-800 text-neutral-400" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Email Address</label>
            <Input disabled value={user?.email || ""} className="bg-neutral-950 border-neutral-800 text-neutral-400" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSignOut} variant="destructive" className="bg-red-900/50 text-red-400 hover:bg-red-900/80 hover:text-red-300 border border-red-900">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
