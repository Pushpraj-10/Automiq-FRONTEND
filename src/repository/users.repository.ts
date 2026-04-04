import { requestJson } from "../hooks/httpClient";
import { User } from "../types";

export function getCurrentUser(token: string) {
  return requestJson<User>("/users/me", { token });
}
