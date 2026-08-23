import type { Request, Response } from 'express';
import type { InterviewQuestionResponse, InterviewSetupResponse } from '../types/interview.js';
import {
  validateInterviewQuestionRequest,
  validateInterviewSetup,
} from '../services/interview-setup.service.js';
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
