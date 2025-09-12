#  API documentation 


---
## Base URL
All API endpoints are rooted at:

```
/api
```

Requests require a valid JWT in `Authorization: Bearer <token>` unless the endpoint is the OAuth redirect flow which uses Google OAuth.

---
## Authentication / OAuth

### GET /api/auth/google
Starts the Google OAuth2 flow (redirects the browser to Google's consent screen).

**Response:** 302 Redirect to Google OAuth consent URL.

### GET /api/auth/google/callback?code=...
Callback endpoint Google redirects to after user consents. The server should exchange the `code` for access/refresh tokens, store the refresh token securely, and issue a local JWT for API access.

**Response example (JSON):**
```json
{ "token": "<JWT>", "user": { "id": "u_123", "email": "me@example.com" } }
```

**Notes:** The project README states the app uses Gmail OAuth and Google APIs for inbox/calendar operations.

---
## User endpoints

### GET /api/users/me
Return profile for the authenticated user.

**Response example:**
```json
{ "id": "u_123", "email": "me@example.com", "name": "Alice" }
```

---
## Mailbox / Messages

### GET /api/messages?label=inbox&limit=50&unread_only=false
Returns a paginated list of messages synced from the user's Gmail account (via background sync or webhook).

**Response (excerpt):**
```json
[
  {
    "id": "msg_abc",
    "threadId": "th_1",
    "snippet": "Hey, can we meet tomorrow?",
    "from": "bob@example.com",
    "to": ["me@example.com"],
    "subject": "Meeting?",
    "receivedAt": "2025-09-10T08:12:00Z",
    "labels": ["INBOX"],
    "isRead": false
  }
]
```

### POST /api/messages/sync
Trigger a manual mailbox sync for the authenticated user (server may also use push notifications/webhooks). Request body may include `label` or `since` to limit the sync.

**Response:** `202 Accepted` — sync scheduled / started.

---
## AI Reply Suggestions

### POST /api/suggestions
Generate reply suggestions for an existing message or thread.

**Request body:**
```json
{ "messageId": "msg_abc", "count": 3 }
```

**Response:**
```json
{
  "messageId": "msg_abc",
  "suggestions": [
    { "id": "s1", "text": "Thanks — that works for me.", "score": 0.87 },
    { "id": "s2", "text": "I prefer Monday — can we do that?", "score": 0.72 }
  ]
}
```

### POST /api/suggestions/{id}/apply
Apply or send a selected suggestion (server may open a draft or send directly depending on user preference).

**Request body:**
```json
{ "messageId": "msg_abc", "send": false }
```

**Response:** `200 OK` with updated draft or send status.

---
## Scheduling / Smart Calendar

### POST /api/schedule/slots
Compute available meeting slots for participants, taking timezones into account.

**Request body:**
```json
{
  "attendees": ["bob@example.com"],
  "durationMinutes": 30,
  "dateRange": { "from": "2025-09-15", "to": "2025-09-17" },
  "timezone": "Asia/Kolkata"
}
```

**Response:**
```json
{ "slots": [ { "start": "2025-09-15T09:30:00+05:30", "end": "2025-09-15T10:00:00+05:30" } ] }
```

### POST /api/schedule/create
Create a Google Calendar event on behalf of the user.

**Request body:**
```json
{
  "summary": "Sync meeting",
  "start": "2025-09-15T09:30:00+05:30",
  "end": "2025-09-15T10:00:00+05:30",
  "attendees": ["bob@example.com"],
  "description": "Created from Tricom scheduler"
}
```

**Response:** Event object from Google Calendar (or a trimmed local representation).


---
## Admin / Diagnostics

### GET /api/admin/sync-status
Return last-sync times, queue lengths, and health info for background workers.

---
## Errors & Auth
- Use `401 Unauthorized` when JWT is missing/invalid.
- Use `403 Forbidden` when user lacks required scopes (e.g., Calendar scope).
- Use `400 Bad Request` for validation failures and `409 Conflict` for idempotency collisions.

---
## Examples (curl)

Start Google OAuth (open in browser — not curl):
```
GET /api/auth/google
```

Request suggestions for a message:
```bash
curl -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"messageId":"msg_abc","count":2}' https://your-host/api/suggestions
```

Create a calendar event:
```bash
curl -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"summary":"Call","start":"2025-09-15T09:30:00+05:30","end":"2025-09-15T10:00:00+05:30","attendees":["bob@example.com"]}' https://your-host/api/schedule/create
```

---
## Notes & references
The project README highlights Gmail OAuth, inbox sync, AI reply suggestions, and calendar scheduling as core features — these are the main API surfaces described here. For implementation details, check `server/` in the repository. citeturn0view0