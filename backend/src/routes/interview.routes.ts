import { Router } from 'express';
import {
  evaluateAnswer,
  generateInterviewQuestion,
  setupInterview,
} from '../controllers/interview.controller.js';

export const interviewRouter = Router();

interviewRouter.post('/setup', setupInterview);
interviewRouter.post('/question', generateInterviewQuestion);
interviewRouter.post('/evaluate-answer', evaluateAnswer);
