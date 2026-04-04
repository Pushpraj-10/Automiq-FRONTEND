"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Settings2, Globe, Clock, Zap, Plus, Trash2, Check, ArrowDown, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { getWorkflow, updateWorkflow } from "@/state/slices/workflows.slice";
import { fetchWorkflowActions, saveWorkflowAction, deleteAction } from "@/state/slices/actions.slice";
import type { ActionType, WorkflowAction } from "@/types";

export default function WorkflowBuilder() {
  const params = useParams();
  const workflowId = params.id as string;
  const dispatch = useAppDispatch();

  const workflow = useAppSelector((s) => s.workflows.selected);
  const actions = useAppSelector((s) => s.actions.byWorkflow[workflowId] || []);
  const actionsStatus = useAppSelector((s) => s.actions.status);

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("");

  // Load workflow + actions on mount
  useEffect(() => {
    dispatch(getWorkflow(workflowId));
    dispatch(fetchWorkflowActions(workflowId));
  }, [dispatch, workflowId]);

  // Sync local name state when workflow loads
  useEffect(() => {
    if (workflow) setWorkflowName(workflow.name);
  }, [workflow]);

  // Select first step by default
  useEffect(() => {
    if (actions.length > 0 && !selectedStepId) {
      setSelectedStepId(actions[0].id);
    }
  }, [actions, selectedStepId]);

  const selectedStep = actions.find((a) => a.id === selectedStepId);
  const sortedActions = [...actions].sort((a, b) => a.stepNumber - b.stepNumber);

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case "webhook_notification": return <Zap className="w-5 h-5 text-amber-500" />;
      case "http_request": return <Globe className="w-5 h-5 text-blue-500" />;
      case "delay": return <Clock className="w-5 h-5 text-purple-500" />;
      case "send_email": return <Globe className="w-5 h-5 text-green-500" />;
      default: return <Settings2 className="w-5 h-5 text-neutral-400" />;
    }
  };

  const handleNameBlur = () => {
    if (workflow && workflowName !== workflow.name) {
      dispatch(updateWorkflow({ workflowId, changes: { name: workflowName } }));
    }
  };

  const handlePublish = () => {
    dispatch(updateWorkflow({ workflowId, changes: { status: "active" } }));
  };

  const addStep = () => {
    const nextStep = sortedActions.length + 1;
    dispatch(
      saveWorkflowAction({
        workflowId,
        stepNumber: nextStep,
        type: "http_request",
        name: "New Action",
        config: {},
        isActive: true,
      })
    );
  };

  const handleDeleteStep = (actionId: string) => {
    dispatch(deleteAction(actionId));
    if (selectedStepId === actionId) setSelectedStepId(null);
  };

  const handleStepConfigSave = (step: WorkflowAction, changes: Partial<Pick<WorkflowAction, "name" | "config" | "onFailure">>) => {
    dispatch(
      saveWorkflowAction({
        workflowId,
        stepNumber: step.stepNumber,
        type: step.type,
        name: changes.name ?? step.name,
        config: changes.config ?? step.config,
        onFailure: changes.onFailure ?? step.onFailure,
        isActive: step.isActive,
      })
    );
  };

  if (actionsStatus === "loading" && sortedActions.length === 0 && !workflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Builder Header */}
      <header className="h-16 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/workflows" className="text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-neutral-800" />
          <div className="flex items-center gap-3">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={handleNameBlur}
              className="h-8 w-64 bg-transparent border-transparent hover:border-neutral-800 focus:border-neutral-700 text-base font-semibold px-2"
            />
            <Badge className="bg-neutral-800 text-neutral-300 hover:bg-neutral-800 rounded capitalize">
              {workflow?.status || "draft"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800">
            Test Flow
          </Button>
          <Button onClick={handlePublish} className="bg-blue-600 text-white hover:bg-blue-700">
            Publish Workflow
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 bg-neutral-950/50 overflow-y-auto p-12 relative flex flex-col items-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 w-full max-w-lg pb-32">
            {sortedActions.map((step, index) => {
              const isSelected = selectedStepId === step.id;
              const isTrigger = index === 0;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    onClick={() => setSelectedStepId(step.id)}
                    className={`w-full group cursor-pointer transition-all duration-200 rounded-xl border ${
                      isSelected
                        ? "bg-neutral-900 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-[1.02]"
                        : "bg-neutral-950 border-neutral-800 hover:border-neutral-600"
                    }`}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-500/10" : "bg-neutral-900"}`}>
                        {getActionIcon(step.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-neutral-200"}`}>
                            {step.name || step.type}
                          </h3>
                          {isTrigger && <Badge className="h-5 px-1.5 text-[10px] bg-indigo-500/10 text-indigo-400 border-none">Trigger</Badge>}
                        </div>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          Step {step.stepNumber} · {step.type.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className={`shrink-0 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {index < sortedActions.length - 1 && (
                    <div className="h-10 border-l border-dashed border-neutral-700 my-1 relative">
                      <ArrowDown className="w-3 h-3 absolute -bottom-2 -left-[6px] text-neutral-700" />
                    </div>
                  )}
                </div>
              );
            })}

            {sortedActions.length < (workflow?.maxSteps ?? 5) && (
              <div className="flex flex-col items-center mt-1">
                <div className="h-8 border-l border-dashed border-neutral-700 mb-1" />
                <Button
                  variant="outline"
                  onClick={addStep}
                  className="rounded-full h-10 w-10 p-0 bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Property Panel Sidebar */}
        {selectedStep && (
          <aside className="w-96 bg-neutral-950 border-l border-neutral-800 shrink-0 flex flex-col shadow-2xl z-20">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-neutral-900 rounded-md">
                  {getActionIcon(selectedStep.type)}
                </div>
                <div className="font-semibold text-white">{selectedStep.name || selectedStep.type}</div>
              </div>
              <Button onClick={() => handleDeleteStep(selectedStep.id)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-red-400 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <Tabs defaultValue="setup" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-neutral-800 bg-neutral-950 p-0 h-12">
                <TabsTrigger value="setup" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 px-6 h-full text-neutral-400 data-[state=active]:text-white">
                  Setup
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 px-6 h-full text-neutral-400 data-[state=active]:text-white">
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="flex-1 p-6 overflow-y-auto m-0 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Step Name</label>
                  <Input
                    value={selectedStep.name || ""}
                    onChange={() => {}} // Controlled locally; save on blur for real app
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>

                {/* Dynamic Configuration based on Action Type */}
                {selectedStep.type === "http_request" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2 col-span-1">
                        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Method</label>
                        <Select value={(selectedStep.config.method as string) || "POST"} onValueChange={() => {}}>
                          <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white font-mono">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-900 border-neutral-800 text-white font-mono">
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">URL</label>
                        <Input
                          placeholder="https://api.example.com"
                          value={(selectedStep.config.url as string) || ""}
                          onChange={() => {}}
                          className="bg-neutral-900 border-neutral-800 text-white font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Body (JSON)</label>
                      <textarea
                        className="w-full h-48 bg-neutral-900 border border-neutral-800 rounded-md p-3 text-sm text-neutral-300 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        placeholder={'{\n  "key": "value"\n}'}
                        defaultValue={(selectedStep.config.body as string) || ""}
                      />
                    </div>
                  </div>
                )}

                {selectedStep.type === "delay" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Duration</label>
                      <Input type="number" defaultValue={(selectedStep.config.duration as number) || 1} className="bg-neutral-900 border-neutral-800 text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Unit</label>
                      <Select value={(selectedStep.config.unit as string) || "minutes"} onValueChange={() => {}}>
                        <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {selectedStep.type === "webhook_notification" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Webhook URL</label>
                    <Input readOnly value={(selectedStep.config.url as string) || "—"} className="bg-neutral-900 border-neutral-800 text-blue-400 font-mono text-xs" />
                    <p className="text-xs text-neutral-500">Sends a notification to this webhook URL.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="flex-1 p-6 overflow-y-auto m-0 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Failure Strategy</label>
                    <p className="text-xs text-neutral-400">What should happen if this step fails?</p>
                    <Select value={(selectedStep.onFailure?.strategy as string) || "retry"} onValueChange={() => {}}>
                      <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                        <SelectItem value="stop">Stop Workflow</SelectItem>
                        <SelectItem value="retry">Auto Retry</SelectItem>
                        <SelectItem value="ignore">Ignore and Continue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        )}
      </div>
    </div>
  );
}
