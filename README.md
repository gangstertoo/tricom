# Email Workflow Tool (MERN + TypeScript)

A production-ready MERN + TypeScript app that reads Gmail, suggests AI replies with priority scoring, and schedules meetings via Google Calendar with timezone handling.

## Tech

- React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Lucide + React Query + Zustand
- Express + MongoDB (Mongoose) + Zod + JWT
- Google APIs (Gmail, Calendar) via OAuth 2.0

## Features

- Gmail OAuth, inbox sync, priority scoring (spam/neutral/urgent)
- AI reply suggestions (service-based, pluggable provider)
- Smart Scheduling with timezone-aware slot suggestions and Calendar creation
- Responsive dashboard UI, dark/light theme
- Periodic background refresh; sockets/SSE can be added later

## Quick Start

1) Create Google OAuth credentials (Web application)
- Authorized redirect URI: <YOUR_PUBLIC_URL>/api/auth/google/callback (use local dev URL in dev)

2) Provision MongoDB (Atlas recommended)

3) Configure environment variables (prefer using the platform env configuration)
- MONGO_URI
- JWT_SECRET
- CLIENT_URL (e.g. http://localhost:8080)
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI (e.g. http://localhost:8080/api/auth/google/callback)

4) Install and run
- pnpm install
- pnpm dev

5) Build and run production
- pnpm build && pnpm start

## Deployment

You can deploy to providers like Netlify, Vercel, or Railway.
- Netlify: configure build command `pnpm run build` and publish directory `dist/spa`.
- Vercel: set build command `pnpm run build:client` and output directory `dist/spa` (or use a custom server if needed).
- Railway: build server with `pnpm run build:server` and start with `node dist/server/node-build.mjs`.

Ensure environment variables are configured in your hosting provider.

## API Documentation

See docs/api.md for endpoints, authentication, and example payloads.

## Project Structure

- client/: pages, components, hooks, lib (API client, auth store)
- server/: controllers, routes, services, models, middleware, config
- shared/: shared types between client and server

## Development Notes

- Follow MVC: controllers (HTTP), services (business logic), models (db), routes (wiring)
- Strict typing across server and client; avoid any/unknown
- Use middleware for auth, validation, and error handling
- React Query handles caching; refetchOnWindowFocus disabled to avoid noisy refetch
- Polling can be tuned via refetchInterval; real-time can be added via SSE/WebSocket

## Testing

- pnpm test (Vitest)

## Security & Privacy

- Helmet, CORS, JWT-based auth
- Stores only necessary Google OAuth tokens for Gmail/Calendar

## Contributing / Commit Conventions

- Small, focused commits with descriptive messages
- Keep controllers thin; place logic in services
- Maintain docs (README + docs/api.md) alongside code changes
