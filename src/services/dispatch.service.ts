import { dispatchRepository } from "../repository";

export function enqueueWorkflow(token: string, workflowId: string) {
  if (!token) throw new Error("auth token is required");
  if (!workflowId) throw new Error("workflowId is required");
  return dispatchRepository.enqueueWorkflow(token, workflowId).then((res) => res.execution);
}

export function listExecutions(token: string, limit?: number) {
  if (!token) throw new Error("auth token is required");
  return dispatchRepository.listExecutions(token, limit).then((res) => res.executions);
}

export function getExecution(token: string, executionId: string) {
  if (!token) throw new Error("auth token is required");
  if (!executionId) throw new Error("executionId is required");
  return dispatchRepository.getExecution(token, executionId).then((res) => res.execution);
}

export function getExecutionSteps(token: string, executionId: string, limit?: number) {
  if (!token) throw new Error("auth token is required");
  if (!executionId) throw new Error("executionId is required");
  return dispatchRepository.getExecutionSteps(token, executionId, limit);
}

export function replayExecution(token: string, executionId: string) {
  if (!token) throw new Error("auth token is required");
  if (!executionId) throw new Error("executionId is required");
  return dispatchRepository.replayExecution(token, executionId).then((res) => res.execution);
}
