export interface User {
  id: number;
  name: string;
  account: string;
  class: string | null;
  seat_number: number | null;
  student_id: string | null;
  role: 'student' | 'teacher';
  group_type: 'experimental' | 'control' | null;
}

export type ActivityStatus = 'pending' | 'reading' | 'notes' | 'reasoning' | 'completed';

export interface Scenario {
  id: number;
  title: string;
  created_at: string;
  status: ActivityStatus | null;
  started_at: string | null;
  completed_at: string | null;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth:logout'));
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  login: (account: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ account, password }),
    }),
  me: () => request<{ user: User }>('/auth/me'),

  scenarios: () => request<{ scenarios: Scenario[] }>('/scenarios'),
  updateActivity: (scenarioId: number, status: ActivityStatus) =>
    request<{ activity: object }>(`/scenarios/${scenarioId}/activity`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  notes: (scenarioId: number) =>
    request<{ notes: object[] }>(`/notes/${scenarioId}`),
  saveNotes: (scenarioId: number, notes: object[]) =>
    request<{ ok: boolean }>(`/notes/${scenarioId}`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  reasoning: (scenarioId: number) =>
    request<{ submission: ReasoningSubmission | null }>(`/reasoning/${scenarioId}`),
  saveReasoning: (scenarioId: number, data: ReasoningSubmission) =>
    request<{ ok: boolean }>(`/reasoning/${scenarioId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export interface ReasoningSubmission {
  stance: '贊成' | '不贊成';
  agreeLevel: number;
  args: object[];
}
