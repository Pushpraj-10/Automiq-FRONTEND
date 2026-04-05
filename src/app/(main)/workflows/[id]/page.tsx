"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import type { WorkflowAction } from "@/types";
import {
  deleteAction,
  fetchWorkflowActions,
  saveWorkflowAction,
  validateWorkflow,
} from "@/state/slices/actions.slice";
import { enqueueWorkflow as enqueueWorkflowExecution } from "@/state/slices/dispatch.slice";
import { getWorkflow, updateWorkflow } from "@/state/slices/workflows.slice";
import {
  WorkflowEditor,
  type WorkflowEditorSaveRequest,
  type WorkflowEditorSaveResponse,
} from "./components/workflow-editor";

const EMPTY_ACTIONS: WorkflowAction[] = [];

export default function WorkflowBuilderPage() {
  const params = useParams();
  const workflowId = params.id as string;
  const dispatch = useAppDispatch();
  const authToken = useAppSelector((state) => state.auth.token);

  const workflowState = useAppSelector((state) => state.workflows);
  const actionsState = useAppSelector((state) => state.actions);
  const actions = useAppSelector((state) => state.actions.byWorkflow[workflowId] ?? EMPTY_ACTIONS);

  const workflow = useMemo(() => {
    if (workflowState.selected?.id === workflowId) {
      return workflowState.selected;
    }

    return workflowState.items.find((item) => item.id === workflowId);
  }, [workflowId, workflowState.items, workflowState.selected]);

  useEffect(() => {
    if (!workflowId) return;
    dispatch(getWorkflow(workflowId));
    dispatch(fetchWorkflowActions(workflowId));
  }, [dispatch, workflowId]);

  const persistWorkflow = useCallback(
    async (request: WorkflowEditorSaveRequest): Promise<WorkflowEditorSaveResponse> => {
      if (!workflowId) {
        throw new Error("Workflow ID is missing");
      }

      if (!workflow) {
        throw new Error("Workflow not loaded yet");
      }

      if (request.name !== workflow.name || request.status !== workflow.status) {
        await dispatch(
          updateWorkflow({
            workflowId,
            changes: {
              name: request.name,
              status: request.status,
            },
          }),
        ).unwrap();
      }

      for (const actionId of request.deletedActionIds) {
        await dispatch(deleteAction(actionId)).unwrap();
      }

      const steps: WorkflowEditorSaveResponse["steps"] = [];

      for (const step of request.steps) {
        const saved = await dispatch(
          saveWorkflowAction({
            workflowId,
            stepNumber: step.stepNumber,
            type: step.type,
            name: step.name,
            config: step.config,
            onFailure: step.onFailure,
            isActive: step.isActive,
            nodeId: step.nodeId,
            position: step.position,
            editorMeta: step.editorMeta,
          }),
        ).unwrap();

        steps.push({
          stepNumber: saved.stepNumber,
          id: saved.id,
        });
      }

      return { steps };
    },
    [dispatch, workflow, workflowId],
  );

  const handleSave = useCallback(
    async (request: WorkflowEditorSaveRequest) => {
      return persistWorkflow(request);
    },
    [persistWorkflow],
  );

  const handlePublish = useCallback(
    async (request: WorkflowEditorSaveRequest) => {
      const saved = await persistWorkflow({
        ...request,
        status: "active",
      });

      try {
        const execution = await dispatch(enqueueWorkflowExecution(workflowId)).unwrap();
        return {
          ...saved,
          dispatchExecutionId: execution.id,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to enqueue workflow execution";
        const partialError = new Error(`Workflow was published, but dispatch failed: ${message}`) as Error & {
          __kind: "publish_dispatch_partial";
          steps: WorkflowEditorSaveResponse["steps"];
        };
        partialError.__kind = "publish_dispatch_partial";
        partialError.steps = saved.steps;
        throw partialError;
      }
    },
    [dispatch, persistWorkflow, workflowId],
  );

  const handleRetryDispatch = useCallback(async () => {
    const execution = await dispatch(enqueueWorkflowExecution(workflowId)).unwrap();
    return { executionId: execution.id };
  }, [dispatch, workflowId]);

  const handleValidate = useCallback(
    async (request: WorkflowEditorSaveRequest) => {
      const steps = request.steps.map((step, index) => ({
        id: step.id || `step_${step.stepNumber || index + 1}`,
        type: step.type,
        name: step.name,
        config: step.config,
        onFailure: step.onFailure,
      }));

      return dispatch(validateWorkflow(steps)).unwrap();
    },
    [dispatch],
  );

  const isLoading =
    workflowState.status === "loading" ||
    (actionsState.status === "loading" && actions.length === 0);

  return (
    <div className="h-full p-0">
      <WorkflowEditor
        workflowId={workflowId}
        authToken={authToken}
        workflow={workflow}
        actions={actions}
        isLoading={isLoading}
        onSave={handleSave}
        onPublish={handlePublish}
        onRetryDispatch={handleRetryDispatch}
        onValidate={handleValidate}
      />
    </div>
  );
}
