import { RequestHandler } from "express";
import { Email } from "../models/Email";
import { User } from "../models/User";
import { syncRecentEmails, generateAISuggestions, suggestMeetingTimes } from "../services/emailService";
import { AuthedRequest } from "../middleware/auth";

export const listEmails: RequestHandler = async (req: AuthedRequest, res) => {
  const { q, priority } = req.query as { q?: string; priority?: string };
  const filter: any = { userId: req.userId };
  if (priority) filter.priority = priority;
  if (q) filter.$text = { $search: q };
  const emails = await Email.find(filter).sort({ date: -1 }).limit(100);
  res.json({ emails });
};

export const syncEmails: RequestHandler = async (req: AuthedRequest, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const synced = await syncRecentEmails(user);
    res.json({ count: synced.length });
  } catch (e) {
    next(e);
  }
};

export const getEmail: RequestHandler = async (req: AuthedRequest, res) => {
  const email = await Email.findOne({ _id: req.params.id, userId: req.userId });
  if (!email) return res.status(404).json({ error: "Not found" });
  res.json({ email });
};

export const aiSuggest: RequestHandler = async (req: AuthedRequest, res) => {
  const email = await Email.findOne({ _id: req.params.id, userId: req.userId });
  if (!email) return res.status(404).json({ error: "Not found" });
  const suggestions = generateAISuggestions(email.subject, email.snippet);
  email.aiSuggestions = suggestions;
  await email.save();
  res.json({ suggestions });
};

export const scheduleSuggest: RequestHandler = async (req: AuthedRequest, res) => {
  const { attendees, durationMins, timezone } = req.body as {
    attendees: string[];
    durationMins: number;
    timezone: string;
  };
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const result = await suggestMeetingTimes(user, attendees, durationMins, timezone || user.timezone);
  res.json(result);
};
