import type { Request, Response } from 'express';
import type {
  AnswerEvaluationResponse,
  NextQuestionResponse,
  InterviewQuestionResponse,
  InterviewSetupResponse,
} from '../types/interview.js';
import {
  validateAnswerEvaluationRequest,
  validateInterviewQuestionRequest,
  validateInterviewSetup,
  validateNextQuestionRequest,
} from '../services/interview-setup.service.js';
import { evaluateInterviewAnswer } from '../services/answer-evaluation.service.js';
import { generateAdaptiveNextQuestion } from '../services/adaptive-question.service.js';
import { generateFirstInterviewQuestion } from '../services/question-generation.service.js';

export function setupInterview(request: Request, response: Response<InterviewSetupResponse>): void {
  const configuration = validateInterviewSetup(request.body);

  response.status(200).json({
    success: true,
    message: 'Interview setup validated successfully',
    configuration,
  });
}

export async function generateInterviewQuestion(
  request: Request,
  response: Response<InterviewQuestionResponse>,
): Promise<void> {
  const context = validateInterviewQuestionRequest(request.body);
  const question = await generateFirstInterviewQuestion(context);

  response.status(200).json({ success: true, question });
}

export async function evaluateAnswer(
  request: Request,
  response: Response<AnswerEvaluationResponse>,
): Promise<void> {
  const context = validateAnswerEvaluationRequest(request.body);
  const evaluation = await evaluateInterviewAnswer(context);

  response.status(200).json({ success: true, evaluation });
}

export async function generateNextQuestion(
  request: Request,
  response: Response<NextQuestionResponse>,
): Promise<void> {
  const context = validateNextQuestionRequest(request.body);
  const question = await generateAdaptiveNextQuestion(context);

  response.status(200).json({ success: true, question });
}
