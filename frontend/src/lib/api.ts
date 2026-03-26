import { getToken } from "./token";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...getAuthHeaders(),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  const json = (await res.json().catch(() => null)) as T | ApiErrorBody | null;
  if (!res.ok) {
    const err = json as ApiErrorBody;
    const message = err?.error?.message ?? `Request failed with ${res.status}`;
    const error: Error & { code?: string; details?: unknown } = new Error(message);
    error.code = err?.error?.code;
    error.details = err?.error?.details;
    throw error;
  }

  return json as T;
}

export async function register(payload: {
  email: string;
  password: string;
}) {
  return apiFetch<{ user: { id: string; email: string; role: string } }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function login(payload: { email: string; password: string }) {
  return apiFetch<{ token: string; user: { id: string; email: string; role: string } }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function me() {
  return apiFetch<{ user: { id: string; email: string; role: string } }>("/auth/me", {
    method: "GET",
  });
}

export async function listTasks() {
  return apiFetch<{ tasks: any[] }>("/tasks", { method: "GET" });
}

export async function createTask(payload: {
  title: string;
  description?: string;
  status?: string;
  dueDate?: string | null;
}) {
  return apiFetch<{ task: any }>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTask(
  taskId: string,
  payload: { title?: string; description?: string; status?: string; dueDate?: string | null }
) {
  return apiFetch<{ task: any }>(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTask(taskId: string) {
  return apiFetch<{ deleted: { id: string } }>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}

