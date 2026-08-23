# AI Mock Interview Tool

JobLuxe's AI-powered, text-based mock interview platform. This repository currently contains only the MVP foundation: a frontend application, a backend API, and a verified browser-to-API health check.

## MVP scope

The eventual MVP will guide a user from resume upload and role setup through a personalized, adaptive interview and final performance report. This step deliberately establishes the project foundation only; it does not include interview workflows or simulated results.

## Architecture

```
AI-Mock-Interview/
├── frontend/     # Vite + React UI and backend API calls
└── backend/      # Express API, future business logic and integrations
```

The frontend owns presentation and user interaction. The backend owns API endpoints, business rules, resume processing, AI integration, and future database access.

## Tech stack

- Frontend: Vite, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Planned integrations: MongoDB and an LLM API (not connected yet)

## Folder structure

```
frontend/src/
├── components/   # Reusable UI components (future)
├── hooks/        # Reusable React hooks (future)
├── pages/        # Screen-level components
├── services/     # HTTP client functions
├── types/        # Frontend types (future)
└── utils/        # Frontend utilities (future)

backend/src/
├── ai/           # Future LLM integration
├── config/       # Environment and application configuration
├── controllers/  # HTTP request handlers
├── middleware/   # Future Express middleware
├── models/       # Future database models
├── routes/       # API route definitions
├── services/     # Future business services
├── types/        # Future backend types
└── utils/        # Future backend utilities
```

## Setup

Requirements: Node.js 20.19+ or 22.12+ (Vite 7 requirement) and npm.

1. Copy each example environment file:

   ```powershell
   Copy-Item frontend/.env.example frontend/.env
   Copy-Item backend/.env.example backend/.env
   ```

2. Install the frontend dependencies:

   ```powershell
   npm.cmd install --prefix frontend
   ```

3. Install the backend dependencies:

   ```powershell
   npm.cmd install --prefix backend
   ```

## Local development

Start the backend in one terminal:

```powershell
npm.cmd run dev --prefix backend
```

Start the frontend in another terminal:

```powershell
npm.cmd run dev --prefix frontend
```

- Frontend: http://localhost:5173
- Backend health endpoint: http://localhost:5000/api/health

The landing page calls `GET /api/health` automatically and reports whether the API can be reached.

## Available commands

Run from the repository root:

```powershell
npm.cmd run lint --prefix frontend
npm.cmd run build --prefix frontend
npm.cmd run lint --prefix backend
npm.cmd run build --prefix backend
```

## Implemented today

- Minimal React/Tailwind landing page
- Backend health endpoint returning `{ "success": true, "service": "ai-mock-interview-api" }`
- CORS configuration for the local frontend origin
- Strict TypeScript, ESLint, Prettier, `.gitignore`, and environment templates

## Intentionally not implemented yet

- Authentication and authorization
- MongoDB connection and models
- Resume upload or parsing
- LLM integration
- Interview orchestration, evaluation, adaptation, timeout, scoring, or reporting
- Interview history
- Production deployment configuration

## Suggested next step

Define the interview setup data contract and create the backend endpoint skeletons for setup and interview-session creation. Resume processing, AI calls, persistence, and final reporting should remain separate subsequent steps.
