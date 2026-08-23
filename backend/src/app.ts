import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { healthRouter } from './routes/health.routes.js';
import { resumeRouter } from './routes/resume.routes.js';

export const app = express();

app.use(
  cors({
    origin: env.clientOrigins,
  }),
);
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/resumes', resumeRouter);

app.use(errorHandler);
