import { requestJson } from "../hooks/httpClient";
import { Workflow } from "../types";

export function createWorkflow(
  token: string,
  input: {
    name: string;
    description?: string;
    status?: string;
    maxSteps?: number;
    triggerEventType?: string;
    triggerSource?: string;
  },
) {
  return requestJson<Workflow>("/workflows", {
    method: "POST",
    token,
    body: input,
  });
}

export function listWorkflows(token: string) {
  return requestJson<{ workflows: Workflow[] }>("/workflows", { token });
}

export function getWorkflow(token: string, workflowId: string) {
  return requestJson<Workflow>(`/workflows/${workflowId}`, { token });
}

export function updateWorkflow(
  token: string,
  workflowId: string,
  input: Partial<Pick<Workflow, "name" | "description" | "status" | "triggerEventType" | "triggerSource">>,
) {
  return requestJson<Workflow>(`/workflows/${workflowId}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export function deleteWorkflow(token: string, workflowId: string) {
  return requestJson<void>(`/workflows/${workflowId}`, {
    method: "DELETE",
    token,
  });
}
