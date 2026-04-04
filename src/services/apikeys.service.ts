import { apiKeysRepository } from "../repository";

export function createApiKey(token: string, name: string) {
  if (!token) throw new Error("auth token is required");
  if (!name || name.trim().length < 3) throw new Error("name must be at least 3 characters");
  return apiKeysRepository.createApiKey(token, name.trim());
}

export function listApiKeys(token: string) {
  if (!token) throw new Error("auth token is required");
  return apiKeysRepository.listApiKeys(token).then((res) => res.apiKeys);
}

export function revokeApiKey(token: string, apiKeyId: string) {
  if (!token) throw new Error("auth token is required");
  if (!apiKeyId) throw new Error("apiKeyId is required");
  return apiKeysRepository.revokeApiKey(token, apiKeyId);
}
