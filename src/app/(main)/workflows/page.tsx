"use client";

import React, { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Play, Pause, FileEdit, Trash2, Webhook, Clock, Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { fetchWorkflows, createWorkflow, deleteWorkflow, updateWorkflow } from "@/state/slices/workflows.slice";
import type { Workflow, WorkflowStatus } from "@/types";

export default function WorkflowsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const workflows = useAppSelector((s) => s.workflows.items);
  const status = useAppSelector((s) => s.workflows.status);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWfName, setNewWfName] = useState("");
  const [triggerType, setTriggerType] = useState("");

  useEffect(() => {
    dispatch(fetchWorkflows());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!newWfName || !triggerType) return;
    try {
      const result = await dispatch(
        createWorkflow({ name: newWfName, triggerEventType: triggerType, status: "draft" })
      ).unwrap();
      setIsCreateOpen(false);
      setNewWfName("");
      setTriggerType("");
      router.push(`/workflows/${result.id}`);
    } catch {
      // Error is in Redux state
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteWorkflow(id));
  };

  const handleToggleStatus = (wf: Workflow) => {
    const newStatus: WorkflowStatus = wf.status === "active" ? "paused" : "active";
    dispatch(updateWorkflow({ workflowId: wf.id, changes: { status: newStatus } }));
  };

  const getStatusBadge = (wfStatus: string) => {
    switch (wfStatus) {
      case "active": return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Active</Badge>;
      case "paused": return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Paused</Badge>;
      case "draft": return <Badge className="bg-neutral-500/10 text-neutral-400 hover:bg-neutral-500/20 border-neutral-500/20">Draft</Badge>;
      case "archived": return <Badge className="bg-neutral-500/10 text-neutral-500 hover:bg-neutral-500/20 border-neutral-500/20">Archived</Badge>;
      default: return null;
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case "shopify": case "stripe": return <Webhook className="w-4 h-4 text-blue-400 mr-2" />;
      case "cron": return <Clock className="w-4 h-4 text-purple-400 mr-2" />;
      default: return <Webhook className="w-4 h-4 text-neutral-400 mr-2" />;
    }
  };

  if (status === "loading" && workflows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Workflows</h1>
          <p className="text-neutral-400">Manage, create, and monitor your automation logic.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2 shadow-lg shadow-blue-500/20">
            <Plus className="w-4 h-4 mr-2" /> New Workflow
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Start by naming your workflow and selecting the initial trigger event.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Workflow Name</label>
                <Input
                  placeholder="e.g. Sync Contacts"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trigger Event</label>
                <Select value={triggerType} onValueChange={(val) => setTriggerType(val || "")}>
                  <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white">
                    <SelectValue placeholder="Select a trigger event..." />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                    <SelectItem value="webhook">Incoming Webhook</SelectItem>
                    <SelectItem value="schedule">Scheduled Time (Cron)</SelectItem>
                    <SelectItem value="manual">Manual Execution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-neutral-800 bg-transparent text-white hover:bg-neutral-800">
                Cancel
              </Button>
              <Button onClick={handleCreate} className="bg-blue-600 text-white hover:bg-blue-700" disabled={!newWfName || !triggerType}>
                Continue to Builder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 shadow-2xl">
        <Table>
          <TableHeader className="bg-neutral-900/50">
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400">Name</TableHead>
              <TableHead className="text-neutral-400">Status</TableHead>
              <TableHead className="text-neutral-400">Trigger</TableHead>
              <TableHead className="text-neutral-400">Last Updated</TableHead>
              <TableHead className="text-neutral-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={5} className="h-24 text-center text-neutral-500">
                  No workflows yet. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              workflows.map((wf) => (
                <TableRow key={wf.id} className="border-neutral-800 hover:bg-neutral-900/50">
                  <TableCell className="font-medium text-white">{wf.name}</TableCell>
                  <TableCell>{getStatusBadge(wf.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-neutral-300">
                      {getSourceIcon(wf.triggerSource)}
                      <span className="font-mono text-xs">{wf.triggerEventType || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-400 text-sm">{new Date(wf.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-neutral-400 hover:text-white hover:bg-neutral-800 focus:outline-none">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-white">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer text-neutral-200">
                          <Link href={`/workflows/${wf.id}`} className="flex w-full items-center">
                            <FileEdit className="mr-2 h-4 w-4" /> Edit Flow
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer text-neutral-200">
                          <Link href={`/workflows/${wf.id}/executions`} className="flex w-full items-center">
                            <Activity className="mr-2 h-4 w-4" /> View Executions
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-neutral-800" />
                        {wf.status === "active" ? (
                          <DropdownMenuItem onClick={() => handleToggleStatus(wf)} className="hover:bg-neutral-800 cursor-pointer text-amber-400">
                            <Pause className="mr-2 h-4 w-4" /> Pause Workflow
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleToggleStatus(wf)} className="hover:bg-neutral-800 cursor-pointer text-emerald-400">
                            <Play className="mr-2 h-4 w-4" /> Activate Workflow
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-neutral-800" />
                        <DropdownMenuItem onClick={() => handleDelete(wf.id)} className="hover:bg-red-900/40 cursor-pointer text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
