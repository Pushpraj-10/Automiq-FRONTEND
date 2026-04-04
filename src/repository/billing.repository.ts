import { requestJson } from "../hooks/httpClient";
import { CheckoutSession } from "../types";

export function createCheckout(token: string, priceId: string) {
  return requestJson<CheckoutSession>("/billing/checkout", {
    method: "POST",
    token,
    body: { priceId },
  });
}
