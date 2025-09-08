import { Router } from "express";
import { startGoogleAuth, googleCallback } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { listEmails, syncEmails, getEmail, aiSuggest, scheduleSuggest } from "../controllers/emailController";
import { createEvent } from "../controllers/calendarController";

const router = Router();

// Auth
router.get("/auth/google/start", startGoogleAuth);
router.get("/auth/google/callback", googleCallback);

// Emails
router.get("/emails", requireAuth, listEmails);
router.post("/emails/sync", requireAuth, syncEmails);
router.get("/emails/:id", requireAuth, getEmail);
router.post("/emails/:id/ai-suggest", requireAuth, aiSuggest);
router.post("/schedule/suggest", requireAuth, scheduleSuggest);

// Calendar
router.post("/calendar/events", requireAuth, createEvent);

export default router;
