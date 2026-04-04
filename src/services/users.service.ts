import { usersRepository } from "../repository";

export function getCurrentUser(token: string) {
  if (!token) throw new Error("auth token is required");
  return usersRepository.getCurrentUser(token);
}
