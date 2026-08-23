import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

const GEMINI_MODEL = 'gemini-3.6-flash';
const CONNECTIVITY_PROMPT = 'Respond with exactly: Gemini connection successful.';
const EXPECTED_CONNECTIVITY_RESPONSE = 'Gemini connection successful.';

const QUESTION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    question: { type: 'string' },
    category: { type: 'string', enum: ['technical', 'behavioral', 'problem-solving', 'hr'] },
    difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
    topic: { type: 'string' },
  },
  required: ['question', 'category', 'difficulty', 'topic'],
  additionalProperties: false,
};

const EVALUATION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    technicalKnowledge: { type: 'integer', minimum: 0, maximum: 100 },
    relevance: { type: 'integer', minimum: 0, maximum: 100 },
    communication: { type: 'integer', minimum: 0, maximum: 100 },
    problemSolving: { type: 'integer', minimum: 0, maximum: 100 },
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    improvements: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
  },
  required: [
    'technicalKnowledge',
    'relevance',
    'communication',
    'problemSolving',
    'summary',
    'strengths',
    'improvements',
  ],
  additionalProperties: false,
};

type GeminiErrorCode =
  'MISSING_API_KEY' | 'AUTHENTICATION_ERROR' | 'RATE_LIMITED' | 'API_ERROR' | 'UNEXPECTED_RESPONSE';

export class GeminiProviderError extends Error {
  constructor(
    public readonly code: GeminiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GeminiProviderError';
  }
}

function createGeminiClient(): GoogleGenAI {
  if (!env.geminiApiKey) {
    throw new GeminiProviderError(
      'MISSING_API_KEY',
      'GEMINI_API_KEY is not configured. Add it to backend/.env before running the test.',
    );
  }

  return new GoogleGenAI({ apiKey: env.geminiApiKey });
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const candidate = error as { status?: unknown; statusCode?: unknown };
  const status = candidate.status ?? candidate.statusCode;
  return typeof status === 'number' ? status : undefined;
}

function mapGeminiError(error: unknown): GeminiProviderError {
  if (error instanceof GeminiProviderError) {
    return error;
  }

  const status = getErrorStatus(error);
  if (status === 401 || status === 403) {
    return new GeminiProviderError(
      'AUTHENTICATION_ERROR',
      'Gemini rejected the API key. Confirm GEMINI_API_KEY is valid and has access to the model.',
    );
  }

  if (status === 429) {
    return new GeminiProviderError(
      'RATE_LIMITED',
      'Gemini rate limit or quota was reached. Wait and try the connectivity test again.',
    );
  }

  return new GeminiProviderError(
    'API_ERROR',
    'Gemini could not be reached. Check network access, API availability, and try again.',
  );
}

export async function testGeminiConnectivity(): Promise<string> {
  try {
    const client = createGeminiClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: CONNECTIVITY_PROMPT,
    });
    const responseText = response.text?.trim();

    if (!responseText || responseText !== EXPECTED_CONNECTIVITY_RESPONSE) {
      throw new GeminiProviderError(
        'UNEXPECTED_RESPONSE',
        'Gemini returned an unexpected response to the connectivity test.',
      );
    }

    return responseText;
  } catch (error) {
    throw mapGeminiError(error);
  }
}

export async function generateGeminiQuestion(prompt: string): Promise<string> {
  try {
    const client = createGeminiClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: QUESTION_RESPONSE_SCHEMA,
      },
    });
    const responseText = response.text?.trim();

    if (!responseText) {
      throw new GeminiProviderError(
        'UNEXPECTED_RESPONSE',
        'Gemini returned no text for the interview question.',
      );
    }

    return responseText;
  } catch (error) {
    throw mapGeminiError(error);
  }
}

export async function generateGeminiEvaluation(prompt: string): Promise<string> {
  try {
    const client = createGeminiClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: EVALUATION_RESPONSE_SCHEMA,
      },
    });
    const responseText = response.text?.trim();

    if (!responseText) {
      throw new GeminiProviderError(
        'UNEXPECTED_RESPONSE',
        'Gemini returned no text for the answer evaluation.',
      );
    }

    return responseText;
  } catch (error) {
    throw mapGeminiError(error);
  }
}
