import {
  DIFFICULTIES,
  EXPERIENCE_LEVELS,
  INTERVIEW_TYPES,
  type Difficulty,
  type AnswerEvaluationRequest,
  type ExperienceLevel,
  type InterviewSetupConfiguration,
  type InterviewQuestionRequest,
  type InterviewSetupRequest,
  type InterviewType,
} from '../types/interview.js';
import { ApiError } from '../utils/api-error.js';

const MAX_RESUME_FILENAME_LENGTH = 255;
const MAX_RESUME_TEXT_LENGTH = 100_000;
const MAX_TARGET_ROLE_LENGTH = 120;
const MAX_JOB_DESCRIPTION_LENGTH = 10_000;
const MAX_QUESTION_LENGTH = 2_000;
const MAX_ANSWER_LENGTH = 20_000;

function requiredText(value: unknown, fieldName: string, maximumLength: number): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} is required.`);
  }

  const normalizedValue = value.trim();
  if (normalizedValue.length > maximumLength) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `${fieldName} must be ${maximumLength} characters or fewer.`,
    );
  }

  return normalizedValue;
}

function optionalText(
  value: unknown,
  fieldName: string,
  maximumLength: number,
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be text.`);
  }

  const normalizedValue = value.trim();
  if (normalizedValue.length > maximumLength) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `${fieldName} must be ${maximumLength} characters or fewer.`,
    );
  }

  return normalizedValue || undefined;
}

function enumValue<T extends string>(
  value: unknown,
  supportedValues: readonly T[],
  fieldName: string,
): T {
  if (typeof value !== 'string' || !supportedValues.includes(value as T)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be a supported value.`);
  }

  return value as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateInterviewSetup(payload: unknown): InterviewSetupConfiguration {
  if (!isRecord(payload)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'A valid interview setup is required.');
  }

  const request: InterviewSetupRequest = {
    resumeFilename: requiredText(
      payload.resumeFilename,
      'Resume filename',
      MAX_RESUME_FILENAME_LENGTH,
    ),
    resumeText: requiredText(payload.resumeText, 'Resume text', MAX_RESUME_TEXT_LENGTH),
    targetRole: requiredText(payload.targetRole, 'Target role', MAX_TARGET_ROLE_LENGTH),
    jobDescription: optionalText(
      payload.jobDescription,
      'Job description',
      MAX_JOB_DESCRIPTION_LENGTH,
    ),
    experienceLevel: enumValue<ExperienceLevel>(
      payload.experienceLevel,
      EXPERIENCE_LEVELS,
      'Experience level',
    ),
    interviewType: enumValue<InterviewType>(
      payload.interviewType,
      INTERVIEW_TYPES,
      'Interview type',
    ),
    difficulty: enumValue<Difficulty>(payload.difficulty, DIFFICULTIES, 'Difficulty'),
  };

  return {
    resumeFilename: request.resumeFilename,
    targetRole: request.targetRole,
    ...(request.jobDescription ? { jobDescription: request.jobDescription } : {}),
    experienceLevel: request.experienceLevel,
    interviewType: request.interviewType,
    difficulty: request.difficulty,
  };
}

export function validateInterviewQuestionRequest(payload: unknown): InterviewQuestionRequest {
  if (!isRecord(payload)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'A valid question request is required.');
  }

  return {
    resumeText: requiredText(payload.resumeText, 'Resume text', MAX_RESUME_TEXT_LENGTH),
    targetRole: requiredText(payload.targetRole, 'Target role', MAX_TARGET_ROLE_LENGTH),
    jobDescription: optionalText(
      payload.jobDescription,
      'Job description',
      MAX_JOB_DESCRIPTION_LENGTH,
    ),
    experienceLevel: enumValue<ExperienceLevel>(
      payload.experienceLevel,
      EXPERIENCE_LEVELS,
      'Experience level',
    ),
    interviewType: enumValue<InterviewType>(
      payload.interviewType,
      INTERVIEW_TYPES,
      'Interview type',
    ),
    difficulty: enumValue<Difficulty>(payload.difficulty, DIFFICULTIES, 'Difficulty'),
  };
}

export function validateAnswerEvaluationRequest(payload: unknown): AnswerEvaluationRequest {
  if (!isRecord(payload)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'A valid answer evaluation request is required.');
  }

  return {
    question: requiredText(payload.question, 'Question', MAX_QUESTION_LENGTH),
    answer: requiredText(payload.answer, 'Answer', MAX_ANSWER_LENGTH),
    targetRole: requiredText(payload.targetRole, 'Target role', MAX_TARGET_ROLE_LENGTH),
    experienceLevel: enumValue<ExperienceLevel>(
      payload.experienceLevel,
      EXPERIENCE_LEVELS,
      'Experience level',
    ),
    interviewType: enumValue<InterviewType>(
      payload.interviewType,
      INTERVIEW_TYPES,
      'Interview type',
    ),
    difficulty: enumValue<Difficulty>(payload.difficulty, DIFFICULTIES, 'Difficulty'),
    resumeText: optionalText(payload.resumeText, 'Resume text', MAX_RESUME_TEXT_LENGTH),
  };
}
