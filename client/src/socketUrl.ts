/** В dev Vite на :5173, API и Socket.IO на :3001 */
export function getSocketUrl(): string {
  if (import.meta.env.DEV) return "http://127.0.0.1:3001";
  return window.location.origin;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = import.meta.env.DEV ? "http://127.0.0.1:3001" : "";
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  return res.json() as Promise<T>;
}
