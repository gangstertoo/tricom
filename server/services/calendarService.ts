import { calendarFor } from "./googleService";
import { IUser } from "../models/User";

export async function createCalendarEvent(
  user: IUser,
  title: string,
  attendees: string[],
  startISO: string,
  endISO: string,
  description?: string,
) {
  const calendar = calendarFor(user);
  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: title,
      description,
      attendees: attendees.map((email) => ({ email })),
      start: { dateTime: startISO },
      end: { dateTime: endISO },
    },
  });
  return event.data;
}
