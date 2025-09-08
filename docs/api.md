# API Documentation

Base URL: /api

## Authentication

JWT-based authentication. Obtain token via Google OAuth flow or local auth endpoints.

- GET /auth/google/start → { url }
  - Starts OAuth; returns URL to redirect user to Google consent.
- GET /auth/google/callback?code=… → 302 redirect to CLIENT_URL/auth/callback?token=…
  - On success, redirects with JWT in token query param.
- POST /auth/register { email, password, name } → { token }
- POST /auth/login { email, password } → { token }
- GET /me (Authorization: Bearer <jwt>) → { user }

Use the token as Bearer for protected endpoints.

## Emails

- GET /emails (Authorization)
  - Query:
    - q: string (full-text search across subject, snippet, bodyText, from, to)
    - priority: spam | neutral | urgent
  - Behavior: returns up to 100 emails sorted by date desc; ignores unknown priority values; trims empty q
  - 200: { emails: Email[] }
- POST /emails/sync (Authorization)
  - Requires Google connection on the user
  - Pulls recent Gmail inbox messages, indexes them, and updates priority + suggestions if missing
  - 200: { count: number }
- GET /emails/:id (Authorization)
  - 200: { email: Email }
- POST /emails/:id/ai-suggest (Authorization)
  - Generates AI reply suggestions and persists them to the email
  - 200: { suggestions: string[] }

Email type fields: { _id, gmailId, threadId, from, to[], subject, snippet, bodyHtml?, bodyText?, date, labels[], priority, aiSuggestions[], isRead }

## Scheduling

- POST /schedule/suggest (Authorization)
  - Body: { attendees: string[]; durationMins: number; timezone: string }
  - Returns suggested slots (timezone-aware). For demo, uses working-hours heuristic.
  - 200: { timezone, slots: { start, end }[] }

## Calendar

- GET /calendar/events (Authorization)
  - Returns upcoming events and the last 24h from primary calendar
  - 200: { events: any[] }
- POST /calendar/events (Authorization)
  - Body: { title: string; attendees: string[]; startISO: string; endISO: string; description?: string; timezone?: string }
  - Creates a calendar event via Google Calendar. If timezone is provided, it is applied to start/end.
  - 200: { event }

## Errors

- 400 Bad Request: invalid input or missing integration (e.g., Google not connected)
- 401 Unauthorized: missing/invalid token
- 404 Not Found: resource missing
- 500 Internal Server Error

## Notes

- Text search covers subject, snippet, bodyText, from, to
- Pagination can be added by extending listEmails with skip/limit
- Real-time updates: client currently polls; sockets/SSE can be added if needed
