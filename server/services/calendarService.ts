import { calendarFor } from "./googleService";
import { IUser } from "../models/User";
import { calendarFor } from "./googleService";

export async function createCalendarEvent(
  user: IUser,
  title: string,
  attendees: string[],
  startISO: string,
  endISO: string,
  description?: string,
  timezone?: string,
) {
  const calendar = calendarFor(user);
  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: title,
      description,
      attendees: attendees.map((email) => ({ email })),
      start: { dateTime: startISO, timeZone: timezone },
      end: { dateTime: endISO, timeZone: timezone },
    },
  });
  return event.data;
}

export async function listUpcomingEvents(user: IUser, maxResults = 20) {
  const calendar = calendarFor(user);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const resp = await calendar.events.list({
    calendarId: "primary",
    timeMin: since,
    singleEvents: true,
    orderBy: "startTime",
    maxResults,
  });
  return resp.data.items || [];
}
