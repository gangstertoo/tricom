import { RequestHandler } from "express";
import { User } from "../models/User";
import { createCalendarEvent, listUpcomingEvents } from "../services/calendarService";
import { AuthedRequest } from "../middleware/auth";

export const createEvent: RequestHandler = async (
  req: AuthedRequest,
  res,
  next,
) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.google) return res.status(400).json({ error: "Google not connected" });

    const { title, attendees, startISO, endISO, description, timezone } = req.body as {
      title: string;
      attendees: string[];
      startISO: string;
      endISO: string;
      description?: string;
      timezone?: string;
    };

    const event = await createCalendarEvent(
      user,
      title,
      attendees,
      startISO,
      endISO,
      description,
      timezone,
    );
    res.json({ event });
  } catch (e) {
    next(e);
  }
};

export const listEvents: RequestHandler = async (req: AuthedRequest, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.google) return res.status(400).json({ error: "Google not connected" });
    const events = await listUpcomingEvents(user);
    res.json({ events });
  } catch (e) {
    next(e);
  }
};
