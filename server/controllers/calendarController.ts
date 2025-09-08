import { RequestHandler } from "express";
import { User } from "../models/User";
import { createCalendarEvent } from "../services/calendarService";
import { AuthedRequest } from "../middleware/auth";

export const createEvent: RequestHandler = async (req: AuthedRequest, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { title, attendees, startISO, endISO, description } = req.body as {
      title: string;
      attendees: string[];
      startISO: string;
      endISO: string;
      description?: string;
    };

    const event = await createCalendarEvent(user, title, attendees, startISO, endISO, description);
    res.json({ event });
  } catch (e) {
    next(e);
  }
};
