import { requestJson } from "../hooks/httpClient";
import { EventPreview, EventRecord } from "../types";

export function ingestEvent(input: {
  apiKey: string;
  idempotencyKey: string;
  source?: string;
  eventType: string;
  payloadJson?: Record<string, unknown>;
}) {
  return requestJson<{ event: EventRecord; duplicate: boolean; executionIds: string[] }>("/events", {
    method: "POST",
    apiKey: input.apiKey,
    idempotencyKey: input.idempotencyKey,
    body: {
      source: input.source,
      eventType: input.eventType,
      payloadJson: input.payloadJson || {},
    },
  });
}

export function listMyEvents(token: string, limit?: number) {
  const query = limit ? `?limit=${limit}` : "";
  return requestJson<{ events: EventRecord[] }>(`/events/my${query}`, { token });
}

export function previewEvent(token: string, workflowId: string) {
  return requestJson<EventPreview>(`/events/preview?workflowId=${workflowId}`, { token });
}
