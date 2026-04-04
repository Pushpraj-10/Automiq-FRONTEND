import { workflowsRepository } from "../repository";
import { Workflow } from "../types";

export function createWorkflow(token: string, input: {
  name: string;
  description?: string;
  status?: Workflow["status"];
  maxSteps?: number;
  triggerEventType?: string;
  triggerSource?: string;
}) {
  if (!token) throw new Error("auth token is required");
  if (!input?.name || input.name.trim().length === 0) throw new Error("name is required");

  return workflowsRepository.createWorkflow(token, {
    ...input,
    name: input.name.trim(),
  });
}

export function listWorkflows(token: string) {
  if (!token) throw new Error("auth token is required");
  return workflowsRepository.listWorkflows(token).then((res) => res.workflows);
}

export function getWorkflow(token: string, workflowId: string) {
  if (!token) throw new Error("auth token is required");
  if (!workflowId) throw new Error("workflowId is required");
  return workflowsRepository.getWorkflow(token, workflowId);
}

export function updateWorkflow(
  token: string,
  workflowId: string,
  input: Partial<Pick<Workflow, "name" | "description" | "status" | "triggerEventType" | "triggerSource">>,
) {
  if (!token) throw new Error("auth token is required");
  if (!workflowId) throw new Error("workflowId is required");
  if (!input || Object.keys(input).length === 0) throw new Error("at least one field is required");

  return workflowsRepository.updateWorkflow(token, workflowId, {
    ...input,
    name: input.name?.trim(),
    description: input.description?.trim(),
  });
}

export function deleteWorkflow(token: string, workflowId: string) {
  if (!token) throw new Error("auth token is required");
  if (!workflowId) throw new Error("workflowId is required");
  return workflowsRepository.deleteWorkflow(token, workflowId);
}
