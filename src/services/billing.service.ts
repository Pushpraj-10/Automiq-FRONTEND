import { billingRepository } from "../repository";

export function createCheckout(token: string, priceId: string) {
  if (!token) throw new Error("auth token is required");
  if (!priceId || priceId.trim().length === 0) throw new Error("priceId is required");
  return billingRepository.createCheckout(token, priceId.trim());
}
