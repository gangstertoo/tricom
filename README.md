# Custom Email Workflow Tool

A production-ready MERN + TypeScript app that reads Gmail, suggests AI replies with priority scoring, and schedules meetings via Google Calendar with timezone handling.

## Tech
- React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Lucide + React Query + Zustand
- Express + MongoDB (Mongoose) + Zod + JWT
- Google APIs (Gmail, Calendar) via OAuth 2.0

## Features
- Gmail OAuth, inbox sync, priority scoring (spam/neutral/urgent)
- AI reply suggestions (extensible service hook)
- Smart Scheduling with timezone-aware slot suggestions and Calendar creation
- Real-time-ish updates via auto-refetch; pluggable SSE/socket later
- Responsive dashboard UI, dark/light theme

## Getting started
1. Environment
   - Create a Google Cloud project and OAuth2 credentials (Web app)
   - Authorized redirect URI: `${PUBLIC_URL}/api/auth/google/callback`
   - Create a MongoDB database (Atlas recommended)
2. Set environment variables (DevServerControl env vars preferred)
   - MONGO_URI
   - JWT_SECRET
   - CLIENT_URL (e.g. https://your-preview-url)
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - GOOGLE_REDIRECT_URI (e.g. https://your-preview-url/api/auth/google/callback)
3. Install & run
   - pnpm install
   - pnpm dev
4. Build & run
   - pnpm build && pnpm start

## Deployment
Use Netlify or Vercel MCP integrations.
- Netlify: [Connect Netlify MCP](#open-mcp-popover) and deploy; server is bundled as an Express app.
- Vercel: [Connect Vercel MCP](#open-mcp-popover) for automatic deployment.

## API Docs
See docs/api.md

## Testing
- pnpm test (Vitest)

## Code Structure
- server/: controllers, routes, services, models, middleware, config
- client/: pages, components, hooks, store, lib
- shared/: cross-shared types

## Security
- Helmet, CORS, JWT auth
- Store only OAuth tokens needed for Gmail/Calendar

## Notes
- AI suggestions are stubbed; integrate your LLM provider in server/services/emailService.ts
- Real-time via SSE/Socket can be added under server/routes/stream.ts or sockets/
