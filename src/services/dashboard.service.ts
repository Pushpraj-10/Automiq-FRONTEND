import { dashboardRepository } from "../repository";

export function getSummary(token: string) {
  if (!token) throw new Error("auth token is required");
  return dashboardRepository.getSummary(token);
}
