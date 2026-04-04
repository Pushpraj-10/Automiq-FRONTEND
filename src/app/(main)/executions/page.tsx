"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Filter, Search, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { fetchExecutions } from "@/state/slices/dispatch.slice";

export default function ExecutionsPage() {
  const dispatch = useAppDispatch();
  const executions = useAppSelector((s) => s.dispatch.executions);
  const status = useAppSelector((s) => s.dispatch.status);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchExecutions(undefined));
  }, [dispatch]);

  const filtered = searchTerm
    ? executions.filter((e) =>
        e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.workflowId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : executions;

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "succeeded": return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Success</Badge>;
      case "failed": return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Failed</Badge>;
      case "running": return <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">Running</Badge>;
      default: return <Badge className="bg-neutral-500/10 text-neutral-400">Queued</Badge>;
    }
  };

  if (status === "loading" && executions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Executions</h1>
        <p className="text-neutral-400">Monitor all workflow runs across your workspace.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search by ID or workflow..."
            className="pl-9 bg-neutral-900 border-neutral-800 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 shadow-2xl">
        <Table>
          <TableHeader className="bg-neutral-900/50">
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400 w-32">Execution ID</TableHead>
              <TableHead className="text-neutral-400">Workflow</TableHead>
              <TableHead className="text-neutral-400">Status</TableHead>
              <TableHead className="text-neutral-400">Started</TableHead>
              <TableHead className="text-neutral-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={5} className="h-24 text-center text-neutral-500">
                  No executions found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((exec) => (
                <TableRow key={exec.id} className="border-neutral-800 hover:bg-neutral-900/50">
                  <TableCell className="font-mono text-xs text-neutral-400">
                    <Link href={`/executions/${exec.id}`} className="hover:text-blue-400 hover:underline">
                      {exec.id.slice(0, 12)}…
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium text-white">{exec.workflowId}</TableCell>
                  <TableCell>{getStatusBadge(exec.status)}</TableCell>
                  <TableCell className="text-neutral-400 text-sm">
                    {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : "Pending"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/executions/${exec.id}`}>
                      <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                        View Trace
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
