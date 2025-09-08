import { Email, IEmail, Priority } from "../models/Email";
import { IUser } from "../models/User";
import { gmailFor } from "./googleService";
import { fromZonedTime } from "date-fns-tz";

function scorePriority(subject: string, snippet: string): Priority {
  const text = `${subject} ${snippet}`.toLowerCase();
  if (/urgent|asap|immediately|deadline|important/.test(text)) return "urgent";
  if (/unsubscribe|lottery|winner|free money/.test(text)) return "spam";
  return "neutral";
}

export async function syncRecentEmails(user: IUser, max = 25) {
  const gmail = gmailFor(user);
  const resp = await gmail.users.messages.list({
    userId: "me",
    maxResults: max,
    q: "in:inbox",
  });
  const messages = resp.data.messages || [];
  const results: IEmail[] = [] as unknown as IEmail[];
  for (const msg of messages) {
    const full = await gmail.users.messages.get({ userId: "me", id: msg.id! });
    const payload = full.data.payload;
    const headers = payload?.headers || [];
    const get = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
        ?.value || "";
    const subject = get("Subject");
    const from = get("From");
    const to = get("To");
    const snippet = full.data.snippet || "";
    const dateHeader = get("Date");
    const date = dateHeader ? new Date(dateHeader) : new Date();

    const bodyParts = collectBody(payload);

    const priority = scorePriority(subject, snippet);

    const existing = await Email.findOne({
      userId: user._id,
      gmailId: full.data.id,
    });
    const doc =
      existing ||
      new Email({
        userId: user._id,
        gmailId: full.data.id,
        threadId: full.data.threadId,
      });

    doc.set({
      from,
      to: to ? to.split(",").map((s) => s.trim()) : [],
      subject,
      snippet,
      date,
      labels: (full.data.labelIds as string[]) || [],
      bodyHtml: bodyParts.html,
      bodyText: bodyParts.text,
      priority,
      isRead: (full.data.labelIds || []).includes("UNREAD") ? false : true,
      aiSuggestions: doc.aiSuggestions?.length
        ? doc.aiSuggestions
        : generateAISuggestions(subject, snippet),
    });

    await doc.save();
    results.push(doc.toObject() as IEmail);
  }
  return results;
}

export function generateAISuggestions(
  subject: string,
  snippet: string,
): string[] {
  const base = `Subject: ${subject}\n${snippet}`;
  return [
    "Thanks for reaching out! Here’s a quick summary and next steps...",
    "I can meet this week. Sharing a few time options based on your timezone.",
    "Appreciate the update. Let’s schedule a follow-up to align on details.",
  ].map((s) => `${s}\n\n${base}`);
}

function collectBody(payload: any): { html?: string; text?: string } {
  const result: { html?: string; text?: string } = {};
  const stack = [payload];
  while (stack.length) {
    const p = stack.pop();
    if (!p) continue;
    if (p.mimeType === "text/html" && p.body?.data) {
      result.html = Buffer.from(p.body.data, "base64").toString("utf-8");
    }
    if (p.mimeType === "text/plain" && p.body?.data) {
      result.text = Buffer.from(p.body.data, "base64").toString("utf-8");
    }
    if (p.parts) stack.push(...p.parts);
  }
  return result;
}

export async function suggestMeetingTimes(
  user: IUser,
  attendees: string[],
  durationMins: number,
  preferredTZ: string,
) {
  // Uses working hours approximation; in real deployment, call Calendar FreeBusy
  const now = new Date();
  const slots: { start: string; end: string }[] = [];
  for (let d = 0; d < 3; d++) {
    const day = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    for (const hour of [9, 11, 14, 16]) {
      const start = new Date(day);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start.getTime() + durationMins * 60000);
      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }
  }
  return { timezone: preferredTZ, slots };
}
