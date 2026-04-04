import { authRepository } from "../repository";

export function logout(token: string) {
  if (!token) throw new Error("auth token is required");
  return authRepository.logout(token);
}
