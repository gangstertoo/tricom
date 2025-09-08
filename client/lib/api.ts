import { create } from "zustand";

export interface EmailDTO {
  _id: string;
  gmailId: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  snippet: string;
  bodyHtml?: string;
  bodyText?: string;
  date: string;
  labels: string[];
  priority: "spam" | "neutral" | "urgent";
  aiSuggestions: string[];
  isRead: boolean;
}

export interface SuggestSlotsResponse {
  timezone: string;
  slots: { start: string; end: string }[];
}

export const useAuthStore = create<{ token: string | null; setToken: (t: string | null) => void }>((set) => ({
  token: null,
  setToken: (t) => set({ token: t }),
}));

function authHeaders() {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function startGoogleAuth(): Promise<string> {
  const res = await fetch("/api/auth/google/start");
  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function listEmails(params?: { q?: string; priority?: string }) {
  const search = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/emails${search ? `?${search}` : ""}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load emails");
  const data = (await res.json()) as { emails: EmailDTO[] };
  return data.emails;
}

export async function syncEmails() {
  const res = await fetch(`/api/emails/sync`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() } });
  if (!res.ok) throw new Error("Failed to sync emails");
  return (await res.json()) as { count: number };
}

export async function getEmail(id: string) {
  const res = await fetch(`/api/emails/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Not found");
  return (await res.json()) as { email: EmailDTO };
}

export async function aiSuggest(id: string) {
  const res = await fetch(`/api/emails/${id}/ai-suggest`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() } });
  if (!res.ok) throw new Error("AI suggestion failed");
  return (await res.json()) as { suggestions: string[] };
}

export async function scheduleSuggest(input: { attendees: string[]; durationMins: number; timezone: string }) {
  const res = await fetch(`/api/schedule/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to suggest times");
  return (await res.json()) as SuggestSlotsResponse;
}

export async function createCalendarEvent(input: { title: string; attendees: string[]; startISO: string; endISO: string; description?: string }) {
  const res = await fetch(`/api/calendar/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return (await res.json()) as { event: any };
}
