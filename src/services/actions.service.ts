import { actionsRepository } from "../repository";
import { ActionType } from "../types";

export function getCatalog(token: string) {
  if (!token) throw new Error("auth token is required");
  return actionsRepository.getCatalog(token).then((res) => res.actions);
}

export function getActionTypes(token: string) {
  if (!token) throw new Error("auth token is required");
  return actionsRepository.getActionTypes(token).then((res) => res.types);
}

export function validateStep(token: string, step: unknown) {
  if (!token) throw new Error("auth token is required");
  return actionsRepository.validateStep(token, step);
}

export function validateWorkflow(token: string, steps: unknown[]) {
  if (!token) throw new Error("auth token is required");
  if (!Array.isArray(steps)) throw new Error("steps must be an array");
  return actionsRepository.validateWorkflow(token, steps);
}

export function listMyActions(token: string, limit?: number) {
  if (!token) throw new Error("auth token is required");
  return actionsRepository.listMyActions(token, limit).then((res) => res.actions);
}

export function listWorkflowActions(token: string, workflowId: string) {
  if (!token) throw new Error("auth token is required");
  if (!workflowId) throw new Error("workflowId is required");
  return actionsRepository.listWorkflowActions(token, workflowId).then((res) => res.actions);
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
    nodeId?: string;
    position?: { x: number; y: number };
    editorMeta?: Record<string, unknown>;
  },
) {
  if (!token) throw new Error("auth token is required");
  if (!workflowId) throw new Error("workflowId is required");
  if (!Number.isInteger(stepNumber) || stepNumber < 1) throw new Error("stepNumber must be a positive integer");
  if (!input?.type) throw new Error("type is required");
  return actionsRepository.upsertWorkflowAction(token, workflowId, stepNumber, input);
}

export function deleteAction(token: string, actionId: string) {
  if (!token) throw new Error("auth token is required");
  if (!actionId) throw new Error("actionId is required");
  return actionsRepository.deleteAction(token, actionId);
}
