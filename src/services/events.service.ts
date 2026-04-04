import { eventsRepository } from "../repository";

export function ingestEvent(input: {
  apiKey: string;
  idempotencyKey: string;
  source?: string;
  eventType: string;
  payloadJson?: Record<string, unknown>;
}) {
  if (!input.apiKey) throw new Error("apiKey is required");
  if (!input.idempotencyKey) throw new Error("idempotencyKey is required");
  if (!input.eventType || input.eventType.trim().length === 0) throw new Error("eventType is required");

  return eventsRepository.ingestEvent({
    ...input,
    eventType: input.eventType.trim(),
    source: input.source?.trim() || undefined,
  });
}

export function listMyEvents(token: string, limit?: number) {
  if (!token) throw new Error("auth token is required");
  return eventsRepository.listMyEvents(token, limit).then((res) => res.events);
}

export function previewEvent(token: string, workflowId: string) {
  if (!token) throw new Error("auth token is required");
  if (!workflowId) throw new Error("workflowId is required");
  return eventsRepository.previewEvent(token, workflowId);
}
