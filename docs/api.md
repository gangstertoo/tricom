# API Reference
Base URL: /api

## Auth
- GET /auth/google/start → { url }
- GET /auth/google/callback?code=… → 302 redirect to CLIENT_URL/auth/callback?token=…

## Emails
- GET /emails
  - Headers: Authorization: Bearer <jwt>
  - Query: q (string), priority (spam|neutral|urgent)
  - 200: { emails: Email[] }
- POST /emails/sync
  - Headers: Authorization
  - 200: { count: number }
- GET /emails/:id
  - Headers: Authorization
  - 200: { email: Email }
- POST /emails/:id/ai-suggest
  - Headers: Authorization
  - 200: { suggestions: string[] }

## Scheduling
- POST /schedule/suggest
  - Headers: Authorization
  - Body: { attendees: string[]; durationMins: number; timezone: string }
  - 200: { timezone, slots: { start, end }[] }

## Calendar
- POST /calendar/events
  - Headers: Authorization
  - Body: { title, attendees: string[], startISO, endISO, description? }
  - 200: { event }

## JWT
- Use the token from /auth/google/callback query param as Bearer token for subsequent requests.
