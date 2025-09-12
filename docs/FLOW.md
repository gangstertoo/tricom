# Process & workflow

---
## Actors
- **End user** — authorizes Gmail, reviews suggestions, accepts/rejects replies, schedules meetings.
- **Background worker** — performs mailbox sync, generates suggestions, computes time slots.
- **Google APIs** — Gmail for mail access and  Calendar for scheduling events.
- **AI Suggestion Service** — uses OpenRouter API gpt4  model that generates reply suggestions and scores them.

---
## High-level workflow

1. **OAuth & onboarding**
   - User signs in /sign up by email  and connects their Google account via `/api/auth/google` (OAuth2). The server stores refresh tokens securely for long-lived sync. citeturn0view0

2. **Mailbox Sync**
   - Background worker or webhook receives push notification from Gmail. Server enqueues a sync job or triggers immediate fetch.
   - Messages and threads are persisted in MongoDB .

3. **Priority Scoring & Suggestions**
   - After messages are synced, a scoring job ranks messages (spam/neutral/urgent). An AI job produces 1–N reply suggestions per message along with confidence scores.
   - Suggestions are stored and surfaced in the UI via `/api/suggestions`.

4. **Smart Scheduling**
   - From message context or UI action, the user asks to schedule a meeting.
   - The `schedule/slots` endpoint computes possible slots (checks user's calendar availability via Google Calendar API and optionally attendees' free/busy information).
   - The user selects a slot and `/api/schedule/create` creates the calendar event and invites attendees.



---
## Data flows & responsibilities
- **Client (React)**: handles OAuth redirect flow, shows inbox, displays suggestions, and calls scheduler endpoints.
- **Server (Express)**: handles OAuth code exchange, stores tokens, performs syncs, runs AI jobs (or calls external service), and talks to Google Calendar.

---
## Error cases & mitigations
- **Revoked or expired Google tokens**: detect and surface re-auth prompts; store minimal refresh info and retry logic.
- **Insufficient scopes**: return `403` with a helpful message and link to re-authorize with required scopes (Gmail read/write, Calendar events).

---
## Security & privacy notes
- Store refresh tokens encrypted at rest and restrict access.
- Limit logs that store email contents; redact sensitive fields where possible.


