import { requestJson } from "../hooks/httpClient";
import { DashboardSummary } from "../types";

export function getSummary(token: string) {
  return requestJson<DashboardSummary>("/dashboard/summary", { token });
}
