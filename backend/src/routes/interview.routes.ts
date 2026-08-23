import { Router } from 'express';
import { generateInterviewQuestion, setupInterview } from '../controllers/interview.controller.js';

export const interviewRouter = Router();

interviewRouter.post('/setup', setupInterview);
interviewRouter.post('/question', generateInterviewQuestion);
