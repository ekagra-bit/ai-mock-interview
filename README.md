# AI Mock Interview Tool

JobLuxe's AI-powered, text-based mock interview platform. The current MVP includes a React frontend, Express API, in-memory resume extraction, and validated interview setup.

## MVP scope

The eventual MVP will guide a candidate from resume upload and role setup through a personalized, adaptive interview and final performance report. The current step validates setup only. It does not create AI questions, evaluate answers, or run an interview.

## Architecture

```
AI-Mock-Interview/
|- frontend/     # Vite + React UI and backend API calls
`- backend/      # Express API, business logic, and future integrations
```

The frontend owns presentation and user interaction. The backend owns API endpoints, validation, file processing, business rules, and future database/AI integrations.

## Tech stack

- Frontend: Vite, React, React Router, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Resume parsing: Multer, pdf-parse, Mammoth
- LLM provider: Google Gemini via the official `@google/genai` SDK
- Planned integration: MongoDB (not connected yet)

## Setup

Requirements: Node.js 20.19+ or 22.12+ and npm.

```powershell
Copy-Item frontend/.env.example frontend/.env
Copy-Item backend/.env.example backend/.env
npm.cmd install --prefix frontend
npm.cmd install --prefix backend
```

## Local development

Start the backend:

```powershell
npm.cmd run dev --prefix backend
```

Start the frontend in a second terminal:

```powershell
npm.cmd run dev --prefix frontend
```

- Frontend: http://localhost:5173
- Backend health endpoint: http://localhost:5000/api/health

The parsed resume remains in React session memory. It is available to `/setup` until the page is refreshed; files and setup data are not persisted to disk or MongoDB.

## Available commands

```powershell
npm.cmd run lint --prefix frontend
npm.cmd run build --prefix frontend
npm.cmd run format:check --prefix frontend
npm.cmd run lint --prefix backend
npm.cmd run build --prefix backend
npm.cmd run format:check --prefix backend
npm.cmd run test:gemini --prefix backend
```

## Gemini connectivity test

Gemini is configured only for an internal connectivity test at this stage; it is not connected to any API endpoint or interview feature.

1. Add your real key to `backend/.env`:

   ```env
   GEMINI_API_KEY=your_key_here
   ```

2. Run the test:

   ```powershell
   npm.cmd run test:gemini --prefix backend
   ```

The successful output is `Gemini connection successful.` The real `backend/.env` file is Git-ignored and must never be committed. Use `backend/.env.example` as the safe template.

## Resume upload API

`POST /api/resumes/parse` accepts exactly one `multipart/form-data` file using the `file` field.

- Supported formats: PDF and DOCX
- Upload limit: 5 MB
- Validation: filename extension, supplied MIME type (when specific), and file signature
- Processing: text is extracted from the in-memory upload buffer. No resume is permanently saved and no OCR is performed.

## Interview setup API

`POST /api/interviews/setup` validates an interview configuration. It does not save data, call an LLM, or start an interview.

```json
{
  "resumeFilename": "candidate-resume.pdf",
  "resumeText": "Extracted resume text...",
  "targetRole": "Software Engineer",
  "jobDescription": "Optional job description",
  "experienceLevel": "Junior",
  "interviewType": "Technical",
  "difficulty": "Medium"
}
```

Supported values:

- Experience level: `Fresher`, `Junior`, `Mid-Level`, `Senior`
- Interview type: `Technical`, `HR`, `Mixed`
- Difficulty: `Easy`, `Medium`, `Hard`

Success response:

```json
{
  "success": true,
  "message": "Interview setup validated successfully",
  "configuration": {
    "resumeFilename": "candidate-resume.pdf",
    "targetRole": "Software Engineer",
    "jobDescription": "Optional job description",
    "experienceLevel": "Junior",
    "interviewType": "Technical",
    "difficulty": "Medium"
  }
}
```

Failures return `{ "success": false, "error": { "code": "...", "message": "..." } }` without internal stack traces.

## First interview question API

`POST /api/interviews/question` generates and validates one personalized first question from the parsed resume and validated interview preferences.

```json
{
  "resumeText": "Candidate resume text...",
  "targetRole": "Software Engineer",
  "jobDescription": "Optional job description",
  "experienceLevel": "Fresher",
  "interviewType": "Technical",
  "difficulty": "Medium"
}
```

```json
{
  "success": true,
  "question": {
    "question": "In your TaskBoard project, how did you use TypeScript to model task data?",
    "category": "technical",
    "difficulty": "Medium",
    "topic": "TypeScript"
  }
}
```

The backend requires structured JSON from Gemini and validates every response before returning it. A question category is one of `technical`, `behavioral`, `problem-solving`, or `hr`; the returned difficulty must exactly match the request.

## Answer evaluation API

`POST /api/interviews/evaluate-answer` evaluates the answer to the generated first question. Gemini returns only the four component scores and concise feedback; the backend validates that response and calculates the overall score deterministically.

```json
{
  "question": "How would you prevent stale state after an asynchronous API call?",
  "answer": "I would use a functional state update and prevent older requests from overwriting new state.",
  "targetRole": "Frontend Developer",
  "experienceLevel": "Junior",
  "interviewType": "Technical",
  "difficulty": "Medium",
  "resumeText": "Optional parsed resume context"
}
```

```json
{
  "success": true,
  "evaluation": {
    "overallScore": 82,
    "technicalKnowledge": 85,
    "relevance": 80,
    "communication": 78,
    "problemSolving": 84,
    "summary": "...",
    "strengths": ["..."],
    "improvements": ["..."]
  }
}
```

All component scores are integers from 0 to 100. The backend calculates `overallScore` as `technicalKnowledge * 0.35 + relevance * 0.25 + communication * 0.20 + problemSolving * 0.20`, rounded to the nearest integer.

## Implemented today

- PDF/DOCX upload, validation, and readable text extraction
- Resume upload UI with loading, error, and preview states
- Interview setup form with target role, optional job description, centralized enum options, and client/server validation
- One Gemini-generated, schema-validated first question on the interview session page
- One Gemini-generated, schema-validated answer evaluation with deterministic overall scoring
- Gemini provider and internal connectivity test using `gemini-3.6-flash`
- Strict TypeScript, ESLint, Prettier, CORS, environment templates, and git ignores

## Not implemented yet

- Authentication
- MongoDB connection and persistence
- AI/LLM resume analysis
- Adaptive questioning, timer, report, or history
- OCR and voice interviews
- Production deployment configuration
