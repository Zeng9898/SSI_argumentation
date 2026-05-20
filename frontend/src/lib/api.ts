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

export type ActivityStatus =
  | 'pending' | 'reading' | 'notes' | 'reasoning'
  | 'argumentation' | 'ainotes' | 'reflection' | 'review'
  | 'completed';

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

  reviewReasoning: (scenarioId: number) =>
    request<{ submission: ReasoningSubmission | null }>(`/review-reasoning/${scenarioId}`),
  saveReviewReasoning: (scenarioId: number, data: ReasoningSubmission) =>
    request<{ ok: boolean }>(`/review-reasoning/${scenarioId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  initAiChat: (scenarioId: number) =>
    request<{ messages: AiMessage[] }>(`/ai-chat/${scenarioId}/init`, { method: 'POST' }),
  getAiChat: (scenarioId: number) =>
    request<{ messages: AiMessage[] }>(`/ai-chat/${scenarioId}`),
  sendAiChat: (scenarioId: number, userMessage: string) =>
    request<{ assistantMessage: string; messageId: string }>(`/ai-chat/${scenarioId}`, {
      method: 'POST',
      body: JSON.stringify({ userMessage }),
    }),

  initAiReflection: (scenarioId: number) =>
    request<{ messages: AiMessage[] }>(`/ai-reflection/${scenarioId}/init`, { method: 'POST' }),
  getAiReflection: (scenarioId: number) =>
    request<{ messages: AiMessage[] }>(`/ai-reflection/${scenarioId}`),
  sendAiReflection: (scenarioId: number, userMessage: string) =>
    request<{ assistantMessage: string; messageId: string }>(`/ai-reflection/${scenarioId}`, {
      method: 'POST',
      body: JSON.stringify({ userMessage }),
    }),
};

export interface AiMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export interface ReasoningSubmission {
  stance: '贊成' | '不贊成';
  agreeLevel: number;
  args: object[];
}
