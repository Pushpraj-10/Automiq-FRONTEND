"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Activity, Play, Settings, Webhook, Zap, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { fetchSummary } from "@/state/slices/dashboard.slice";
import { fetchExecutions } from "@/state/slices/dispatch.slice";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const summary = useAppSelector((s) => s.dashboard.summary);
  const dashStatus = useAppSelector((s) => s.dashboard.status);
  const executions = useAppSelector((s) => s.dispatch.executions);

  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchExecutions(5));
  }, [dispatch]);

  const totals = summary?.totals;
  const recent = summary?.recent;
  const successRate = totals && totals.executions > 0
    ? ((totals.executionsSucceeded / totals.executions) * 100).toFixed(1)
    : "—";

  if (dashStatus === "loading" && !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-extrabold tracking-[-1px] text-white mb-2 leading-tight">Dashboard</h1>
        <p className="text-[#a0a0a0] font-medium text-[15px]">Overview of your workspace activity and automation metrics.</p>
      </div>

      {/* System Alerts */}
      {recent && recent.failuresLast24h > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="text-red-400 font-bold mb-1">{recent.failuresLast24h} execution{recent.failuresLast24h !== 1 ? "s" : ""} failed</h4>
            <p className="text-red-400/80 text-sm font-medium">Check the Executions page for details.</p>
          </div>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#0e0e0e]/90 backdrop-blur-xl border-white/5 text-white shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-bold text-[#888] uppercase tracking-[1px]">Total Events (30d)</CardTitle>
            <Webhook className="w-4 h-4 text-[#555]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totals?.events ?? "—"}</div>
            {recent && <p className="text-xs text-[#a0a0a0] mt-2 font-medium">{recent.eventsLast24h} in last 24h</p>}
          </CardContent>
        </Card>

        <Card className="bg-[#0e0e0e]/90 backdrop-blur-xl border-white/5 text-white shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-bold text-[#888] uppercase tracking-[1px]">Executions (30d)</CardTitle>
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400/20 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totals?.executions ?? "—"}</div>
            {recent && <p className="text-xs text-[#a0a0a0] mt-2 font-medium">{recent.executionsLast24h} in last 24h</p>}
          </CardContent>
        </Card>

        <Card className="bg-[#0e0e0e]/90 backdrop-blur-xl border-white/5 text-white shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-bold text-[#888] uppercase tracking-[1px]">Success Rate</CardTitle>
            <Activity className="w-4 h-4 text-emerald-500 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-400">{successRate}%</div>
            <p className="text-xs text-[#a0a0a0] mt-2 font-medium">Across all workflows</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0e0e0e]/90 backdrop-blur-xl border-white/5 text-white shadow-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-bold text-[#888] uppercase tracking-[1px]">Active Workflows</CardTitle>
            <Settings className="w-4 h-4 text-[#555]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totals?.workflowsActive ?? "—"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#0e0e0e]/90 backdrop-blur-xl border-white/5 text-white lg:col-span-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Executions</CardTitle>
            <CardDescription className="text-[#a0a0a0] font-medium">Latest automated runs across your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {executions.length === 0 ? (
              <p className="text-[#777] text-sm py-8 text-center font-medium">No executions yet.</p>
            ) : (
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#151515]">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Workflow</TableHead>
                      <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Status</TableHead>
                      <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px] text-right">Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.slice(0, 5).map((exec) => (
                      <TableRow key={exec.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-bold">
                          <Link href={`/executions/${exec.id}`} className="hover:text-yellow-400 hover:underline transition-colors font-semibold">
                            {exec.workflowId}
                          </Link>
                          {exec.errorSummary && <p className="text-[13px] text-red-400 mt-1.5 font-medium">{exec.errorSummary}</p>}
                        </TableCell>
                        <TableCell>
                          {exec.status === "succeeded" && <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 font-bold rounded-md">Success</Badge>}
                          {exec.status === "failed" && <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 border border-red-500/20 font-bold rounded-md">Failed</Badge>}
                          {exec.status === "running" && <Badge className="bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/10 border border-yellow-400/20 font-bold rounded-md">Running</Badge>}
                          {exec.status === "queued" && <Badge className="bg-neutral-500/10 text-neutral-400 hover:bg-neutral-500/10 border border-neutral-500/20 font-bold rounded-md">Queued</Badge>}
                        </TableCell>
                        <TableCell className="text-right text-[#a0a0a0] text-[13px] font-medium">
                          {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : "Pending"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="bg-[#0e0e0e]/90 backdrop-blur-xl border-white/5 text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/workflows" className="block">
              <div className="group cursor-pointer p-4 bg-white/5 border border-white/5 rounded-xl hover:border-yellow-400/30 hover:bg-yellow-400/5 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#FACC15]/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[14px]">Create Workflow</h4>
                    <p className="text-[13px] text-[#777] font-medium mt-0.5">Start from scratch</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/settings/api-keys" className="block">
              <div className="group cursor-pointer p-4 bg-white/5 border border-white/5 rounded-xl hover:border-blue-400/30 hover:bg-blue-400/5 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Settings className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[14px]">API Keys</h4>
                    <p className="text-[13px] text-[#777] font-medium mt-0.5">Manage integration secrets</p>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
