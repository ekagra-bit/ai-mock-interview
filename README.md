# AI Mock Interview Tool

JobLuxe's AI-powered, text-based mock interview platform. The current MVP foundation includes a React frontend, Express API, and in-memory resume text extraction.

## MVP scope

The eventual MVP will guide a candidate from resume upload and role setup through a personalized, adaptive interview and final performance report. This step implements only resume upload and text extraction—there is no AI analysis, interview workflow, or simulated result.

## Architecture

```
AI-Mock-Interview/
├── frontend/     # Vite + React UI and backend API calls
└── backend/      # Express API, business logic, and future integrations
```

The frontend owns presentation and user interaction. The backend owns API endpoints, validation, file processing, business rules, and future database/AI integrations.

## Tech stack

- Frontend: Vite, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Resume parsing: Multer, pdf-parse, Mammoth
- Planned integrations: MongoDB and an LLM API (not connected yet)

## Folder structure

```
frontend/src/
├── components/   # Reusable UI components
├── hooks/        # Reusable React hooks (future)
├── pages/        # Screen-level components
├── services/     # HTTP client functions
├── types/        # Frontend types (future)
└── utils/        # Frontend utilities (future)

backend/src/
├── ai/           # Future LLM integration
├── config/       # Environment and application configuration
├── controllers/  # HTTP request handlers
├── middleware/   # Upload and error middleware
├── models/       # Future database models
├── routes/       # API route definitions
├── services/     # Resume validation and parsing services
├── types/        # Backend types
└── utils/        # Shared API error and text utilities
```

## Setup

Requirements: Node.js 20.19+ or 22.12+ (Vite 7 requirement) and npm.

1. Copy each example environment file:

   ```powershell
   Copy-Item frontend/.env.example frontend/.env
   Copy-Item backend/.env.example backend/.env
   ```

2. Install dependencies:

   ```powershell
   npm.cmd install --prefix frontend
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

The landing page calls `GET /api/health` automatically and provides a PDF/DOCX upload form.

## Available commands

Run from the repository root:

```powershell
npm.cmd run lint --prefix frontend
npm.cmd run build --prefix frontend
npm.cmd run lint --prefix backend
npm.cmd run build --prefix backend
```

## Resume upload API

`POST /api/resumes/parse` accepts exactly one `multipart/form-data` file using the `file` field.

- Supported formats: PDF and DOCX
- Upload limit: 5 MB
- Validation: filename extension, supplied MIME type (when specific), and file signature
- Processing: text is extracted directly from the in-memory upload buffer. No resume is permanently saved and no OCR is performed.

Successful response:

```json
{
  "success": true,
  "filename": "candidate-resume.pdf",
  "fileType": "pdf",
  "textLength": 4821,
  "text": "Extracted resume text..."
}
```

Failures use the following shape without exposing internal errors:

```json
{
  "success": false,
  "error": {
    "code": "SOME_ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

## Implemented today

- Minimal React/Tailwind landing page and backend health check
- Upload UI with selected-file, loading, success, error, and extracted-text preview states
- Secure, in-memory PDF and DOCX text extraction
- Friendly responses for missing, empty, oversized, unsupported, mismatched, and malformed files
- CORS configuration for the local frontend origin
- Strict TypeScript, ESLint, Prettier, `.gitignore`, and environment templates

## Intentionally not implemented yet

- Authentication and authorization
- MongoDB connection, models, or persistence
- AI/LLM resume analysis, summarization, or question generation
- Interview setup, orchestration, evaluation, timer, scoring, reporting, and history
- OCR for scanned-image PDFs
- Production deployment configuration

## Current limitations

- A PDF must contain selectable/readable text. Scanned-image PDFs are reported as unextractable because OCR is intentionally out of scope.
- A DOCX upload must be a readable Word document; malformed documents are rejected.
- Files are processed temporarily in memory for this MVP and are not persisted.

## Suggested next step

Define the interview-setup data contract and add endpoint skeletons for role, experience, interview type, and difficulty. Keep persistence and AI calls as separate subsequent steps.
