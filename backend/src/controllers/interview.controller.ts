import type { Request, Response } from 'express';
import type { InterviewSetupResponse } from '../types/interview.js';
import { validateInterviewSetup } from '../services/interview-setup.service.js';

export function setupInterview(request: Request, response: Response<InterviewSetupResponse>): void {
  const configuration = validateInterviewSetup(request.body);

  response.status(200).json({
    success: true,
    message: 'Interview setup validated successfully',
    configuration,
  });
}
