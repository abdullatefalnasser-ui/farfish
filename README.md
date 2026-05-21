# farfish

Kuwait-first activities discovery and booking platform.

## Overview

- Mobile-first user app for discovering and booking activities in Kuwait.
- Provider dashboard for businesses to manage listings and bookings.
- Admin panel for platform moderation, approvals, and bookings overview.

## Stack

- React + Vite for frontends
- Node.js + Express + lowdb JSON backend for demo
- Tap Payments for payment integration

## Apps

- `apps/user-app` — user-facing discovery and booking experience
- `apps/provider-dashboard` — provider listing and bookings management
- `apps/admin-panel` — admin controls for providers, listings, and bookings

## Getting started

1. Install dependencies: `corepack pnpm install`
2. Start the API: `node backend/src/index.js`
3. Open the user app: `http://localhost:4173`
4. Open the provider dashboard: `http://localhost:4174`
5. Open the admin panel: `http://localhost:4175`

## Backend

- `backend` contains the Express API service
- `database/schema.sql` contains the initial PostgreSQL schema
