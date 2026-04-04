import { requestJson } from "../hooks/httpClient";
import { DispatchExecution, ExecutionStep } from "../types";

export function enqueueWorkflow(token: string, workflowId: string) {
  return requestJson<{ execution: DispatchExecution }>(`/dispatch/workflows/${workflowId}/enqueue`, {
    method: "POST",
    token,
  });
}

export function listExecutions(token: string, limit?: number) {
  const query = limit ? `?limit=${limit}` : "";
  return requestJson<{ executions: DispatchExecution[] }>(`/dispatch/executions${query}`, { token });
}

export function getExecution(token: string, executionId: string) {
  return requestJson<{ execution: DispatchExecution }>(`/dispatch/executions/${executionId}`, { token });
}

export function getExecutionSteps(token: string, executionId: string, limit?: number) {
  const query = limit ? `?limit=${limit}` : "";
  return requestJson<{ execution: DispatchExecution; steps: ExecutionStep[] }>(
    `/dispatch/executions/${executionId}/steps${query}`,
    { token },
  );
}

export function replayExecution(token: string, executionId: string) {
  return requestJson<{ execution: DispatchExecution }>(`/dispatch/executions/${executionId}/replay`, {
    method: "POST",
    token,
  });
}
