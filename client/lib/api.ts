import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

export const useAuthStore = create(
  persist<{
    token: string | null;
    setToken: (t: string | null) => void;
  }>(
    (set) => ({
      token: null,
      setToken: (t) => set({ token: t }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    },
  ),
);

function authHeaders() {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function startGoogleAuth(): Promise<string> {
  const res = await fetch("/api/auth/google/start", { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to start Google auth");
  }
  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("Google auth URL not available. Check server env.");
  return data.url;
}

export async function listEmails(params?: { q?: string; priority?: string }) {
  const searchParams = new URLSearchParams();
  const q = params?.q?.toString().trim();
  if (q) searchParams.set("q", q);
  const pr = params?.priority?.toString().trim().toLowerCase();
  if (pr && pr !== "undefined" && pr !== "null") searchParams.set("priority", pr);
  const search = searchParams.toString();
  const res = await fetch(`/api/emails${search ? `?${search}` : ""}`, {
    headers: authHeaders(),
  });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error("Failed to load emails");
  const data = (await res.json()) as { emails: EmailDTO[] };
  return data.emails;
}

export async function syncEmails() {
  const res = await fetch(`/api/emails/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to sync emails");
  return (await res.json()) as { count: number };
}

export async function getEmail(id: string) {
  const res = await fetch(`/api/emails/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Not found");
  return (await res.json()) as { email: EmailDTO };
}

export async function aiSuggest(id: string) {
  const res = await fetch(`/api/emails/${id}/ai-suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) throw new Error("AI suggestion failed");
  return (await res.json()) as { suggestions: string[] };
}

export async function scheduleSuggest(input: {
  attendees: string[];
  durationMins: number;
  timezone: string;
}) {
  const res = await fetch(`/api/schedule/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to suggest times");
  return (await res.json()) as SuggestSlotsResponse;
}

export async function createCalendarEvent(input: {
  title: string;
  attendees: string[];
  startISO: string;
  endISO: string;
  description?: string;
  timezone?: string;
}) {
  const res = await fetch(`/api/calendar/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return (await res.json()) as { event: any };
}

export async function listCalendarEvents() {
  const res = await fetch(`/api/calendar/events`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load events");
  return (await res.json()) as { events: any[] };
}

export async function registerAccount(input: { email: string; password: string; name: string }) {
  const res = await fetch(`/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { token: string };
  useAuthStore.getState().setToken(data.token);
  return data;
}

export async function loginAccount(input: { email: string; password: string }) {
  const res = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { token: string };
  useAuthStore.getState().setToken(data.token);
  return data;
}

export async function getMe() {
  const res = await fetch(`/api/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Unauthorized");
  return (await res.json()) as { user: { email: string; name: string; picture?: string; timezone: string; googleConnected?: boolean } };
}
