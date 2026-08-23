export interface HealthResponse {
  success: boolean;
  service: string;
}

import type {
  InterviewQuestion,
  InterviewQuestionRequest,
  InterviewSetupRequest,
  ValidatedInterviewConfiguration,
} from '../types/interview';

export interface ParsedResumeResponse {
  success: true;
  filename: string;
  fileType: 'pdf' | 'docx';
  textLength: number;
  text: string;
}

export interface InterviewSetupResponse {
  success: true;
  message: string;
  configuration: ValidatedInterviewConfiguration;
}

export interface InterviewQuestionResponse {
  success: true;
  question: InterviewQuestion;
}

interface ApiFailureResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/api/health`);

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}.`);
  }

  return response.json() as Promise<HealthResponse>;
}

export async function parseResume(file: File): Promise<ParsedResumeResponse> {
  const formData = new FormData();
  formData.append('file', file);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/resumes/parse`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new ApiRequestError('Unable to reach the API. Check that the backend is running.');
  }

  const data = (await response.json().catch(() => null)) as
    ParsedResumeResponse | ApiFailureResponse | null;

  if (!response.ok || !data || !data.success) {
    const error = data && 'error' in data ? data.error : undefined;
    throw new ApiRequestError(error?.message ?? 'The resume could not be processed.', error?.code);
  }

  return data;
}

export async function setupInterview(
  configuration: InterviewSetupRequest,
): Promise<InterviewSetupResponse> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/interviews/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configuration),
    });
  } catch {
    throw new ApiRequestError('Unable to reach the API. Check that the backend is running.');
  }

  const data = (await response.json().catch(() => null)) as
    InterviewSetupResponse | ApiFailureResponse | null;

  if (!response.ok || !data || !data.success) {
    const error = data && 'error' in data ? data.error : undefined;
    throw new ApiRequestError(
      error?.message ?? 'The interview setup could not be validated.',
      error?.code,
    );
  }

  return data;
}

export async function generateInterviewQuestion(
  context: InterviewQuestionRequest,
): Promise<InterviewQuestionResponse> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/interviews/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    });
  } catch {
    throw new ApiRequestError('Unable to reach the API. Check that the backend is running.');
  }

  const data = (await response.json().catch(() => null)) as
    InterviewQuestionResponse | ApiFailureResponse | null;

  if (!response.ok || !data || !data.success) {
    const error = data && 'error' in data ? data.error : undefined;
    throw new ApiRequestError(
      error?.message ?? 'The first interview question could not be generated.',
      error?.code,
    );
  }

  return data;
}
