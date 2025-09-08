import { Router } from "express";
import { startGoogleAuth, googleCallback } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import {
  listEmails,
  syncEmails,
  getEmail,
  aiSuggest,
  scheduleSuggest,
} from "../controllers/emailController";
import { createEvent, listEvents } from "../controllers/calendarController";
import { me } from "../controllers/userController";
import { register, login } from "../controllers/authLocalController";

const router = Router();

// Auth
router.get("/auth/google/start", requireAuth, startGoogleAuth);
router.get("/auth/google/callback", googleCallback);

// Local auth
router.post("/auth/register", register);
router.post("/auth/login", login);

// Me
router.get("/me", requireAuth, me);

// Emails
router.get("/emails", requireAuth, listEmails);
router.post("/emails/sync", requireAuth, syncEmails);
router.get("/emails/:id", requireAuth, getEmail);
router.post("/emails/:id/ai-suggest", requireAuth, aiSuggest);
router.post("/schedule/suggest", requireAuth, scheduleSuggest);

// Calendar
router.post("/calendar/events", requireAuth, createEvent);
router.get("/calendar/events", requireAuth, listEvents);

export default router;
