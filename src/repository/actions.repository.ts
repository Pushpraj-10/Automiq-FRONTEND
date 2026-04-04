import { requestJson } from "../hooks/httpClient";
import {
  ActionCatalogEntry,
  ActionType,
  StepValidationResult,
  WorkflowAction,
  WorkflowValidationResult,
} from "../types";

export function getCatalog(token: string) {
  return requestJson<{ actions: ActionCatalogEntry[] }>("/actions/catalog", { token });
}

export function getActionTypes(token: string) {
  return requestJson<{ types: ActionType[] }>("/actions/types", { token });
}

export function validateStep(token: string, step: unknown) {
  return requestJson<StepValidationResult>("/actions/validate/step", {
    method: "POST",
    token,
    body: { step },
  });
}

export function validateWorkflow(token: string, steps: unknown[]) {
  return requestJson<WorkflowValidationResult>("/actions/validate/workflow", {
    method: "POST",
    token,
    body: { steps },
  });
}

export function listMyActions(token: string, limit?: number) {
  const query = limit ? `?limit=${limit}` : "";
  return requestJson<{ actions: WorkflowAction[] }>(`/actions/my${query}`, { token });
}

export function listWorkflowActions(token: string, workflowId: string) {
  return requestJson<{ actions: WorkflowAction[] }>(`/actions/workflows/${workflowId}`, { token });
}

export function upsertWorkflowAction(
  token: string,
  workflowId: string,
  stepNumber: number,
  input: {
    type: ActionType;
    name?: string;
    config: Record<string, unknown>;
    onFailure?: Record<string, unknown>;
    isActive?: boolean;
  },
) {
  return requestJson<WorkflowAction>(`/actions/workflows/${workflowId}/steps/${stepNumber}`, {
    method: "PUT",
    token,
    body: input,
  });
}

export function deleteAction(token: string, actionId: string) {
  return requestJson<void>(`/actions/${actionId}`, {
    method: "DELETE",
    token,
  });
}
