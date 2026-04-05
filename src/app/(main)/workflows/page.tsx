"use client";

import React, { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Play, Pause, FileEdit, Trash2, Webhook, Clock, Activity, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

const triggerOptions = [
  {
    label: "Incoming Webhook",
    icon: Webhook,
    iconClassName: "text-blue-400",
    aliases: ["webhook", "incoming_webhook"],
  },
  {
    label: "Scheduled Time (Cron)",
    icon: Clock,
    iconClassName: "text-purple-400",
    aliases: ["schedule", "cron"],
  },
  {
    label: "Manual Execution",
    icon: Play,
    iconClassName: "text-yellow-400",
    aliases: ["manual"],
  },
] as const;

const triggerSourceOptions = ["custom", "shopify", "stripe", "cron", "manual"] as const;

export default function WorkflowsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const workflows = useAppSelector((s) => s.workflows.items);
  const status = useAppSelector((s) => s.workflows.status);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWfName, setNewWfName] = useState("");
  const [newWfDescription, setNewWfDescription] = useState("");
  const [triggerType, setTriggerType] = useState("");
  const [triggerSource, setTriggerSource] = useState<(typeof triggerSourceOptions)[number]>("custom");
  const [maxSteps, setMaxSteps] = useState("5");
  const [activeWorkflowActionId, setActiveWorkflowActionId] = useState<string | null>(null);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);

  const canCreate = newWfName.trim().length > 0 && Boolean(triggerType);

  useEffect(() => {
    dispatch(fetchWorkflows());
  }, [dispatch]);

  const handleCreate = async () => {
    const workflowName = newWfName.trim();
    if (!workflowName || !triggerType) return;

    const safeMaxSteps = Math.max(1, Math.min(5, Number(maxSteps) || 5));

    try {
      const result = await dispatch(
        createWorkflow({
          name: workflowName,
          description: newWfDescription.trim() || undefined,
          triggerEventType: triggerType,
          triggerSource,
          maxSteps: safeMaxSteps,
          status: "draft",
        })
      ).unwrap();
      setIsCreateOpen(false);
      setNewWfName("");
      setNewWfDescription("");
      setTriggerType("");
      setTriggerSource("custom");
      setMaxSteps("5");
      router.push(`/workflows/${result.id}`);
    } catch {
      // Error is in Redux state
    }
  };

  const handleDelete = async (wf: Workflow) => {
    setWorkflowToDelete(wf);
  };

  const confirmDeleteWorkflow = async () => {
    if (!workflowToDelete) return;
    try {
      setActiveWorkflowActionId(workflowToDelete.id);
      await dispatch(deleteWorkflow(workflowToDelete.id)).unwrap();
      setWorkflowToDelete(null);
    } catch {
      // Error is in Redux state
    } finally {
      setActiveWorkflowActionId((current) =>
        current === workflowToDelete.id ? null : current
      );
    }
  };

  const handleToggleStatus = async (wf: Workflow) => {
    const newStatus: WorkflowStatus = wf.status === "active" ? "paused" : "active";
    try {
      setActiveWorkflowActionId(wf.id);
      await dispatch(
        updateWorkflow({ workflowId: wf.id, changes: { status: newStatus } })
      ).unwrap();
    } catch {
      // Error is in Redux state
    } finally {
      setActiveWorkflowActionId((current) =>
        current === wf.id ? null : current
      );
    }
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

  const getTriggerPreview = (triggerEventType?: string | null, source?: string) => {
    const normalizedTriggerType = (triggerEventType || "").trim().toLowerCase();
    const matched = triggerOptions.find(
      (option) =>
        option.label.toLowerCase() === normalizedTriggerType ||
        (option.aliases as readonly string[]).includes(normalizedTriggerType)
    );

    if (matched) {
      return {
        label: matched.label,
        icon: (
          <matched.icon className={`w-4 h-4 mr-2 ${matched.iconClassName}`} />
        ),
      };
    }

    if ((source || "").toLowerCase() === "cron") {
      return {
        label: triggerEventType || "Scheduled Time (Cron)",
        icon: <Clock className="w-4 h-4 text-purple-400 mr-2" />,
      };
    }

    if (source === "shopify" || source === "stripe") {
      return {
        label: triggerEventType || "Incoming Webhook",
        icon: <Webhook className="w-4 h-4 text-blue-400 mr-2" />,
      };
    }

    return {
      label: triggerEventType || "—",
      icon: <Webhook className="w-4 h-4 text-neutral-400 mr-2" />,
    };
  };

  if (status === "loading" && workflows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-1px] text-white mb-2 leading-tight">Workflows</h1>
          <p className="text-[#a0a0a0] font-medium text-[15px]">Manage, create, and monitor your automation logic.</p>
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setNewWfName("");
              setNewWfDescription("");
              setTriggerType("");
              setTriggerSource("custom");
              setMaxSteps("5");
            }
          }}
        >
          <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-full bg-[#FACC15] px-5 text-xs font-extrabold text-black shadow-[0_5px_15px_rgba(250,204,21,0.25)] transition-all hover:-translate-y-px hover:bg-yellow-500">
            <Plus className="w-4 h-4 mr-2" /> New Workflow
          </DialogTrigger>
          <DialogContent size="sm" className="shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Workflow</DialogTitle>
              <DialogDescription className="text-[#a0a0a0] font-medium">
                Start by naming your workflow and selecting the initial trigger event.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#ddd]">Workflow Name</label>
                <Input
                  placeholder="e.g. Sync Contacts"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  maxLength={80}
                  className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500 focus-visible:border-white/25 focus-visible:ring-0"
                />
                <p className="text-xs font-medium text-neutral-500">Use a short, clear name. You can rename it later.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#ddd]">Description (Optional)</label>
                <textarea
                  value={newWfDescription}
                  onChange={(e) => setNewWfDescription(e.target.value)}
                  maxLength={200}
                  className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-white/25"
                  placeholder="What should this workflow automate?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#ddd]">Trigger Event</label>
                <Select value={triggerType} onValueChange={(val) => setTriggerType(val || "")}>
                  <SelectTrigger className="h-11 w-full rounded-md my-2 border-white/10 bg-white/5 text-white focus-visible:border-white/25 focus-visible:ring-0">
                    <SelectValue placeholder="Select a trigger event..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-white/10 bg-[#151515] p-1.5 text-white">
                    {triggerOptions.map((option) => (
                      <SelectItem
                        key={option.label}
                        value={option.label}
                        className="rounded-sm text-neutral-200 focus:bg-white/8 focus:text-white"
                      >
                        <option.icon className={`size-4 ${option.iconClassName}`} /> {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs font-medium text-neutral-500">Start with one trigger. You can add more logic in the builder.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#ddd]">Trigger Source</label>
                  <Select value={triggerSource} onValueChange={(value) => setTriggerSource(value as (typeof triggerSourceOptions)[number])}>
                    <SelectTrigger className="h-11 w-full rounded-md border-white/10 bg-white/5 text-white focus-visible:border-white/25 focus-visible:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-white/10 bg-[#151515] p-1.5 text-white">
                      {triggerSourceOptions.map((source) => (
                        <SelectItem key={source} value={source} className="rounded-sm text-neutral-200 focus:bg-white/8 focus:text-white">
                          {source.charAt(0).toUpperCase() + source.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#ddd]">Max Steps</label>
                  <Select value={maxSteps} onValueChange={(value) => setMaxSteps(value || "5")}>
                    <SelectTrigger className="h-11 w-full rounded-md border-white/10 bg-white/5 text-white focus-visible:border-white/25 focus-visible:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-white/10 bg-[#151515] p-1.5 text-white">
                      {["1", "2", "3", "4", "5"].map((step) => (
                        <SelectItem key={step} value={step} className="rounded-sm text-neutral-200 focus:bg-white/8 focus:text-white">
                          {step}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-11 rounded-lg border-white/15 bg-transparent px-5 text-neutral-200 font-semibold tracking-[0.1px] transition-all duration-200 hover:bg-white/8 hover:border-white/25 hover:text-white active:translate-y-0"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                className="h-11 rounded-xl bg-[#FACC15] px-5 text-black font-extrabold tracking-[0.1px] shadow-[0_12px_28px_rgba(250,204,21,0.22)] transition-all duration-200 hover:bg-[#ffe066] hover:shadow-[0_16px_32px_rgba(250,204,21,0.3)] disabled:bg-[#FACC15]/80 disabled:text-black/70 disabled:opacity-100 active:translate-y-0"
                disabled={!canCreate}
              >
                Continue to Builder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(workflowToDelete)}
          onOpenChange={(open) => {
            if (!open) {
              setWorkflowToDelete(null);
            }
          }}
        >
          <DialogContent size="sm" className="shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Delete Workflow?</DialogTitle>
              <DialogDescription className="text-[#a0a0a0] font-medium">
                This action cannot be undone. The workflow
                {workflowToDelete ? ` \"${workflowToDelete.name}\"` : ""} will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setWorkflowToDelete(null)}
                className="h-11 rounded-lg border-white/15 bg-transparent px-5 text-neutral-200 font-semibold tracking-[0.1px] transition-all duration-200 hover:bg-white/8 hover:border-white/25 hover:text-white active:translate-y-0"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteWorkflow}
                disabled={!workflowToDelete || activeWorkflowActionId === workflowToDelete.id}
                className="h-11 rounded-xl bg-red-500/90 px-5 text-white font-extrabold tracking-[0.1px] transition-all duration-200 hover:bg-red-500 disabled:bg-red-500/60 disabled:text-white/80"
              >
                {workflowToDelete && activeWorkflowActionId === workflowToDelete.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#0e0e0e]/90 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <Table>
          <TableHeader className="bg-[#151515]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Name</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Status</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Trigger</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px]">Last Updated</TableHead>
              <TableHead className="text-[#888] text-[11px] font-extrabold uppercase tracking-[1.5px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={5} className="h-24 text-center text-[#777] font-medium">
                  No workflows yet. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              workflows.map((wf) => {
                const triggerPreview = getTriggerPreview(
                  wf.triggerEventType,
                  wf.triggerSource
                );
                const isRowActionPending = activeWorkflowActionId === wf.id;

                return (
                  <TableRow key={wf.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-bold text-white">{wf.name}</TableCell>
                    <TableCell>{getStatusBadge(wf.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-[#aaa] font-medium">
                        {triggerPreview.icon}
                        <span className="text-[13px]">{triggerPreview.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#a0a0a0] text-[13px] font-medium">{new Date(wf.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md p-0 text-neutral-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-5 w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 min-w-64">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="font-bold text-[#888]">Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              className="py-2 font-medium"
                              onClick={() => router.push(`/workflows/${wf.id}`)}
                            >
                              <FileEdit className="mr-2 h-4 w-4" /> Edit Flow
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="py-2 font-medium"
                              onClick={() => router.push(`/workflows/${wf.id}/executions`)}
                            >
                              <Activity className="mr-2 h-4 w-4" /> View Executions
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator className="bg-white/5" />
                          {wf.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(wf)}
                              disabled={isRowActionPending}
                              className="py-2 font-semibold text-amber-400 focus:bg-amber-500/10 focus-visible:bg-amber-500/10"
                            >
                              {isRowActionPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Pause className="mr-2 h-4 w-4" />
                              )}
                              Pause Workflow
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(wf)}
                              disabled={isRowActionPending}
                              className="py-2 font-semibold text-emerald-400 focus:bg-emerald-500/10 focus-visible:bg-emerald-500/10"
                            >
                              {isRowActionPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="mr-2 h-4 w-4" />
                              )}
                              Activate Workflow
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(wf)}
                            variant="destructive"
                            disabled={isRowActionPending}
                            className="mb-1 py-2 font-semibold"
                          >
                            {isRowActionPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
