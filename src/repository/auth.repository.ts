import { requestJson } from "../hooks/httpClient";

export function logout(token: string) {
  return requestJson<{ ok: boolean }>("/auth/logout", {
    method: "POST",
    token,
  });
}
