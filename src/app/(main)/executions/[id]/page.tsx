"use client";

import React, { useEffect } from "react";
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { fetchExecutionSteps, replayExecution } from "@/state/slices/dispatch.slice";

export default function ExecutionTracePage() {
  const params = useParams();
  const executionId = params.id as string;
  const dispatch = useAppDispatch();

  const execution = useAppSelector((s) => s.dispatch.current);
  const steps = useAppSelector((s) => s.dispatch.steps);
  const status = useAppSelector((s) => s.dispatch.status);

  useEffect(() => {
    dispatch(fetchExecutionSteps({ executionId }));
  }, [dispatch, executionId]);

  const handleReplay = () => {
    dispatch(replayExecution(executionId));
  };

  if (status === "loading" && !execution) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "succeeded": return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Succeeded</Badge>;
      case "failed": return <Badge className="bg-red-500/10 text-red-500 border border-red-500/20">Failed</Badge>;
      case "running": return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Running</Badge>;
      default: return <Badge className="bg-neutral-500/10 text-neutral-400">Queued</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <Link href="/executions" className="text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-neutral-800" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-3">
              {executionId.slice(0, 12)}…
              {execution && getStatusBadge(execution.status)}
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Workflow: <span className="text-neutral-200">{execution?.workflowId || "—"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleReplay} variant="outline" className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800">
            <RotateCcw className="w-4 h-4 mr-2" /> Replay Execution
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-4">
            <div>
              <div className="text-xs text-neutral-500 uppercase font-semibold mb-1">Started At</div>
              <div className="text-sm text-neutral-200">{execution?.startedAt ? new Date(execution.startedAt).toLocaleString() : "—"}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 uppercase font-semibold mb-1">Finished At</div>
              <div className="text-sm text-neutral-200">{execution?.finishedAt ? new Date(execution.finishedAt).toLocaleString() : "—"}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 uppercase font-semibold mb-1">Total Steps</div>
              <div className="text-sm text-neutral-200">{steps.length} executed</div>
            </div>
            {execution?.errorSummary && (
              <div>
                <div className="text-xs text-neutral-500 uppercase font-semibold mb-1">Error Summary</div>
                <div className="text-sm text-red-400 p-2 bg-red-500/10 rounded my-1 border border-red-500/20">
                  {execution.errorSummary}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/50">
              <h3 className="font-semibold text-white">Execution Trace</h3>
            </div>

            {steps.length === 0 ? (
              <p className="text-neutral-500 text-sm p-6 text-center">No step data available.</p>
            ) : (
              <Accordion className="w-full">
                {steps.map((step) => (
                  <AccordionItem value={`item-${step.stepIndex}`} key={step.stepIndex} className="border-neutral-800">
                    <AccordionTrigger className="px-4 hover:bg-neutral-900/30 hover:no-underline flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {step.status === "succeeded" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        <div className="flex flex-col items-start ml-2 text-left">
                          <span className="font-medium text-sm text-neutral-200">Step {step.stepIndex + 1}</span>
                          <span className="text-xs text-neutral-500 font-mono mt-0.5">{step.stepType}</span>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4">
                      <div className="pl-9 pt-2">
                        <Tabs defaultValue={step.errorMessage ? "error" : "output"} className="w-full">
                          <TabsList className="bg-neutral-900 border border-neutral-800">
                            {step.errorMessage && <TabsTrigger value="error" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400 text-neutral-400">Error</TabsTrigger>}
                            <TabsTrigger value="input" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400">Input</TabsTrigger>
                            <TabsTrigger value="output" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400">Output</TabsTrigger>
                          </TabsList>

                          {step.errorMessage && (
                            <TabsContent value="error" className="mt-2">
                              <pre className="bg-black border border-red-900 p-3 rounded text-xs text-red-400 overflow-x-auto font-mono">
                                {step.errorMessage}
                              </pre>
                            </TabsContent>
                          )}

                          <TabsContent value="input" className="mt-2">
                            <pre className="bg-black border border-neutral-800 p-3 rounded text-xs text-neutral-300 overflow-x-auto font-mono">
                              {JSON.stringify(step.requestJson, null, 2) || "No input data"}
                            </pre>
                          </TabsContent>

                          <TabsContent value="output" className="mt-2">
                            <pre className="bg-black border border-neutral-800 p-3 rounded text-xs text-neutral-300 overflow-x-auto font-mono">
                              {JSON.stringify(step.responseJson, null, 2) || "No output data"}
                            </pre>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
