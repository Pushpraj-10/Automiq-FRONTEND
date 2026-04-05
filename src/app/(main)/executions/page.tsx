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
      case "succeeded": return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 font-bold rounded-md">Success</Badge>;
      case "failed": return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 border border-red-500/20 font-bold rounded-md">Failed</Badge>;
      case "running": return <Badge className="bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/10 border border-yellow-400/20 font-bold rounded-md">Running</Badge>;
      default: return <Badge className="bg-neutral-500/10 text-neutral-400 hover:bg-neutral-500/10 border border-neutral-500/20 font-bold rounded-md">Queued</Badge>;
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
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-[32px] font-extrabold tracking-[-1px] text-white mb-2 leading-tight">Executions</h1>
        <p className="text-[#a0a0a0] font-medium text-[15px]">Monitor all workflow runs across your workspace.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#888] group-focus-within:text-yellow-400 transition-colors" />
          <Input
            placeholder="Search by ID or workflow..."
            className="h-10 pl-10 bg-white/5 border-white/10 text-white rounded-xl focus-visible:ring-1 focus-visible:ring-yellow-400 focus-visible:border-yellow-400 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#0e0e0e]/90 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <Table>
          <TableHeader className="bg-[#151515]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px] w-32">Execution ID</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Workflow</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Status</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Started</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={5} className="h-24 text-center text-[#777] font-medium">
                  No executions found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((exec) => (
                <TableRow key={exec.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-xs text-[#aaa]">
                    <Link href={`/executions/${exec.id}`} className="hover:text-yellow-400 hover:underline transition-colors font-bold">
                      {exec.id.slice(0, 12)}…
                    </Link>
                  </TableCell>
                  <TableCell className="font-bold text-white">{exec.workflowId}</TableCell>
                  <TableCell>{getStatusBadge(exec.status)}</TableCell>
                  <TableCell className="text-[#a0a0a0] text-[13px] font-medium">
                    {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : "Pending"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/executions/${exec.id}`}>
                      <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-black hover:bg-yellow-400 rounded-full font-extrabold transition-all">
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
