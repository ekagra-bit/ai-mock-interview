import { GeminiProviderError, generateGeminiEvaluation } from '../ai/gemini.provider.js';
import type { AnswerEvaluation, AnswerEvaluationRequest } from '../types/interview.js';
import { ApiError } from '../utils/api-error.js';

const SCORE_DIMENSIONS = [
  'technicalKnowledge',
  'relevance',
  'communication',
  'problemSolving',
] as const;

type EvaluationDimension = (typeof SCORE_DIMENSIONS)[number];
type GeminiEvaluation = Omit<AnswerEvaluation, 'overallScore'>;

function buildEvaluationPrompt(context: AnswerEvaluationRequest): string {
  const resumeContext = context.resumeText
    ? `\nResume context (use only when useful):\n---\n${context.resumeText}\n---`
    : '';

  return `You are an experienced interviewer evaluating one candidate answer in a text-based mock interview.

Interview question:
---
${context.question}
---

Candidate answer:
---
${context.answer}
---

Target role: ${context.targetRole}
Experience level: ${context.experienceLevel}
Interview type: ${context.interviewType}
Difficulty: ${context.difficulty}${resumeContext}

Evaluate only what the candidate actually said. Do not invent demonstrated knowledge or penalize missing irrelevant details. Be fair for the experience level and difficulty. Do not judge grammar, spelling, accent, or writing style unless it materially affects clarity.

Score each dimension from 0 to 100 as an integer:
- technicalKnowledge: correctness, depth, and understanding of relevant concepts.
- relevance: whether the answer directly addresses all important parts of the question.
- communication: clarity, structure, and understandable explanation.
- problemSolving: reasoning, approach, and trade-offs or edge cases when relevant.

Give concise, actionable feedback. Strengths must be supported by the answer. Improvements must be specific and useful. Do not provide an overall score, reasoning trace, chain-of-thought, Markdown fences, or extra fields.

Return JSON only with exactly: technicalKnowledge, relevance, communication, problemSolving, summary, strengths, improvements.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100;
}

function parseFeedbackItems(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 3) {
    return null;
  }

  const items = value.map((item) => (typeof item === 'string' ? item.trim() : ''));
  return items.every(Boolean) ? items : null;
}

function calculateOverallScore(evaluation: Pick<AnswerEvaluation, EvaluationDimension>): number {
  const score =
    evaluation.technicalKnowledge * 0.35 +
    evaluation.relevance * 0.25 +
    evaluation.communication * 0.2 +
    evaluation.problemSolving * 0.2;

  return Math.min(100, Math.max(0, Math.round(score)));
}

function parseEvaluation(responseText: string): AnswerEvaluation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new ApiError(
      502,
      'EVALUATION_GENERATION_FAILED',
      'The evaluation was not in the expected format. Please try again.',
    );
  }

  if (!isRecord(parsed)) {
    throw new ApiError(
      502,
      'EVALUATION_GENERATION_FAILED',
      'The generated evaluation was invalid.',
    );
  }

  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  const strengths = parseFeedbackItems(parsed.strengths);
  const improvements = parseFeedbackItems(parsed.improvements);

  if (
    !summary ||
    !strengths ||
    !improvements ||
    !SCORE_DIMENSIONS.every((dimension) => isScore(parsed[dimension]))
  ) {
    throw new ApiError(
      502,
      'EVALUATION_GENERATION_FAILED',
      'The generated evaluation did not pass validation.',
    );
  }

  const evaluation: GeminiEvaluation = {
    technicalKnowledge: parsed.technicalKnowledge as number,
    relevance: parsed.relevance as number,
    communication: parsed.communication as number,
    problemSolving: parsed.problemSolving as number,
    summary,
    strengths,
    improvements,
  };

  return { ...evaluation, overallScore: calculateOverallScore(evaluation) };
}

function mapProviderError(error: GeminiProviderError): ApiError {
  const errors: Record<GeminiProviderError['code'], ApiError> = {
    MISSING_API_KEY: new ApiError(503, 'GEMINI_UNAVAILABLE', error.message),
    AUTHENTICATION_ERROR: new ApiError(
      502,
      'GEMINI_AUTHENTICATION_ERROR',
      'Gemini authentication failed.',
    ),
    RATE_LIMITED: new ApiError(429, 'GEMINI_RATE_LIMITED', error.message),
    API_ERROR: new ApiError(503, 'GEMINI_API_ERROR', error.message),
    UNEXPECTED_RESPONSE: new ApiError(502, 'EVALUATION_GENERATION_FAILED', error.message),
  };

  return errors[error.code];
}

export async function evaluateInterviewAnswer(
  context: AnswerEvaluationRequest,
): Promise<AnswerEvaluation> {
  try {
    const responseText = await generateGeminiEvaluation(buildEvaluationPrompt(context));
    return parseEvaluation(responseText);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof GeminiProviderError) {
      throw mapProviderError(error);
    }

    throw new ApiError(
      503,
      'GEMINI_API_ERROR',
      'The answer evaluation service is temporarily unavailable.',
    );
  }
}
