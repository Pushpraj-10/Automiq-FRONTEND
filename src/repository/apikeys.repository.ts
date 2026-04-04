import { requestJson } from "../hooks/httpClient";
import { ApiKeyRecord } from "../types";

export function createApiKey(token: string, name: string) {
  return requestJson<{ apiKey: string; record: ApiKeyRecord }>("/apikeys", {
    method: "POST",
    token,
    body: { name },
  });
}

export function listApiKeys(token: string) {
  return requestJson<{ apiKeys: ApiKeyRecord[] }>("/apikeys", { token });
}

export function revokeApiKey(token: string, apiKeyId: string) {
  return requestJson<void>(`/apikeys/${apiKeyId}`, {
    method: "DELETE",
    token,
  });
}
