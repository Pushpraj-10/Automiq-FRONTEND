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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Dashboard</h1>
        <p className="text-neutral-400">Overview of your workspace activity and automation metrics.</p>
      </div>

      {/* System Alerts */}
      {recent && recent.failuresLast24h > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="text-red-400 font-semibold mb-1">{recent.failuresLast24h} execution{recent.failuresLast24h !== 1 ? "s" : ""} failed</h4>
            <p className="text-red-400/80 text-sm">Check the Executions page for details.</p>
          </div>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-neutral-900 border-neutral-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Events (30d)</CardTitle>
            <Webhook className="w-4 h-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals?.events ?? "—"}</div>
            {recent && <p className="text-xs text-neutral-500 mt-1">{recent.eventsLast24h} in last 24h</p>}
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Executions (30d)</CardTitle>
            <Zap className="w-4 h-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals?.executions ?? "—"}</div>
            {recent && <p className="text-xs text-neutral-500 mt-1">{recent.executionsLast24h} in last 24h</p>}
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Success Rate</CardTitle>
            <Activity className="w-4 h-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{successRate}%</div>
            <p className="text-xs text-neutral-500 mt-1">Across all workflows</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Active Workflows</CardTitle>
            <Settings className="w-4 h-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals?.workflowsActive ?? "—"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-neutral-950 border-neutral-800 text-white lg:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription className="text-neutral-400">Latest automated runs across your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {executions.length === 0 ? (
              <p className="text-neutral-500 text-sm py-8 text-center">No executions yet.</p>
            ) : (
              <Table>
                <TableHeader className="bg-neutral-900/50">
                  <TableRow className="border-neutral-800">
                    <TableHead className="text-neutral-400">Workflow</TableHead>
                    <TableHead className="text-neutral-400">Status</TableHead>
                    <TableHead className="text-neutral-400 text-right">Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.slice(0, 5).map((exec) => (
                    <TableRow key={exec.id} className="border-neutral-800 hover:bg-neutral-900/50">
                      <TableCell className="font-medium">
                        <Link href={`/executions/${exec.id}`} className="hover:text-blue-400 hover:underline">
                          {exec.workflowId}
                        </Link>
                        {exec.errorSummary && <p className="text-xs text-red-400 mt-1">{exec.errorSummary}</p>}
                      </TableCell>
                      <TableCell>
                        {exec.status === "succeeded" && <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Success</Badge>}
                        {exec.status === "failed" && <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Failed</Badge>}
                        {exec.status === "running" && <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">Running</Badge>}
                        {exec.status === "queued" && <Badge className="bg-neutral-500/10 text-neutral-400">Queued</Badge>}
                      </TableCell>
                      <TableCell className="text-right text-neutral-400 text-sm">
                        {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : "Pending"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="bg-neutral-900 border-neutral-800 text-white shadow-xl">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/workflows" className="block">
              <div className="group cursor-pointer p-4 bg-neutral-950 border border-neutral-800 rounded-lg hover:border-neutral-600 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded">
                    <Play className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Create Workflow</h4>
                    <p className="text-xs text-neutral-400">Start from scratch</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/settings/api-keys" className="block">
              <div className="group cursor-pointer p-4 bg-neutral-950 border border-neutral-800 rounded-lg hover:border-neutral-600 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded">
                    <Settings className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">API Keys</h4>
                    <p className="text-xs text-neutral-400">Manage integration secrets</p>
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
