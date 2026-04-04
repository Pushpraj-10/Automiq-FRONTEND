export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function getApiUrl(path: string): string {
  if (!path) return API_BASE_URL || "/";
  if (!API_BASE_URL) return path;

  const base = API_BASE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
