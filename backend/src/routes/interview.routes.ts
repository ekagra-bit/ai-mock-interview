import { Router } from 'express';
import { setupInterview } from '../controllers/interview.controller.js';

export const interviewRouter = Router();

interviewRouter.post('/setup', setupInterview);
