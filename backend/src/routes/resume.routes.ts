import { Router } from 'express';
import { parseResumeController } from '../controllers/resume.controller.js';
import { resumeUpload } from '../middleware/upload.middleware.js';

export const resumeRouter = Router();

resumeRouter.post('/parse', resumeUpload.single('file'), parseResumeController);
