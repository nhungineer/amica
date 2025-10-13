## Project overview

Amica is a full-stack application that uses multi-agent orchestration to organise casual gathering by analysing group preferences and recommending venues.

## Tech stack

Backend

- TypeScript
- Prisma schema for database schema
- PostgreSQL database
- Express for API routing
- OpenAI for agent output
- Vercel AI SDK & Zod schema for structured agent output
- Google Places API for venue search

Frontend

- React
- TypeScript
- Vite

Infrastructure

- Railway (backend)
- Vercel (frontend)

## Features

[Current, as of 2025-10-13]

- Create gathering with title, location name, timezone
- Submit responses with preferences (timeslots, max budget, cuisine preferences, dietary restrictions)
- Trigger multi-agent workflow where

1. Preference agent analyse group preferences to find the best timeslot, budget range and cuisine/dietary preferences for the group
2. Venue agent calls Google Places API to search for venue based on the preference analysis, and select the top 3 venues for recommendations
3. Display the 3 venues that are best suited for the group and recommended next steps

## Roadmap

Week 12 (13 - 19 Oct 2025)

- Magic link authentication (Resend API)
- Dynamic timeslot creation
- Polish UX/UI for frontend
- Error handling and recovery
- Enhanced agent logic
- Dashboard view for organisers
- Dashboard view for invitees

## Architecture

### System Overview

- **Frontend (React)** → API calls → **Backend (Express)** → **PostgreSQL**
- Backend orchestrates **two sequential AI agents** for coordination
- External APIs: OpenAI (agent reasoning), Google Places (venue search)

### Agent Workflow

Sequential two-stage pattern:

1. **Preference Agent**: Analyses responses → structured output (budget, cuisine, time)
2. **Venue Agent**: Takes structured criteria → searches Google Places → top 3 recommendations

### State Management

- Multi-user state stored in PostgreSQL
- Gathering lifecycle: `COLLECTING` → `COMPLETED` / `FAILED`
- Agents trigger when all responses received OR RSVP deadline reached

## Local setup

### Prerequisites

- Node.js 18+
- PostgreSQL (or use Railway/Supabase free tier)
- API Keys: OpenAI, Google Places, Resend

### 1. Clone and Install

```bash
git clone https://github.com/nhungineer/amica.git
cd amica

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. Database Setup

```cd backend

# Create PostgreSQL database (local or remote)
# Copy .env.example to .env and add your DATABASE_URL
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Seed with test users (optional)
npm run seed
```

3. Environment Variables

```
Backend (/backend/.env):
DATABASE_URL="postgresql://user:password@localhost:5432/amica"
OPENAI_API_KEY="sk-..."
GOOGLE_PLACES_API_KEY="..."
RESEND_API_KEY="re_..."
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"

Frontend (/frontend/.env):
VITE_API_URL="http://localhost:3000"
```

4. Run Development Servers

Terminal 1 - Backend:

```
cd backend
npm run dev
# Server runs on http://localhost:3000
```

Terminal 2 - Frontend:

```
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

5. Test It Works

- Open http://localhost:5173
- Create a test gathering
- Submit some responses
- Trigger agent workflow

  ***

  Troubleshooting

Port already in use:

- Backend: Change PORT in .env
- Frontend: Change port in vite.config.ts

Database connection error:

- Check DATABASE_URL format
- Ensure PostgreSQL is running

Agent fails:

- Verify OPENAI_API_KEY is valid
- Check GOOGLE_PLACES_API_KEY has Places API and geocode conversion enabled

## What I learned

1. Database schema design for async workflows
2. AI agent orchestration and handoff patterns
3. Full-stack TypeScript patterns
4. API endpoints using Express and CORS
5. React patterns: callback functions, useNavigate(), useState (), useEffect()
6. Production deployment (Railway + Vercel)
