import type { Request, Response } from 'express';
import { parseResume } from '../services/resume.service.js';
import { ApiError } from '../utils/api-error.js';

export async function parseResumeController(request: Request, response: Response): Promise<void> {
  if (!request.file) {
    throw new ApiError(400, 'MISSING_FILE', 'Upload one resume file using the "file" field.');
  }

  const parsedResume = await parseResume(request.file);

  response.status(200).json({
    success: true,
    filename: parsedResume.filename,
    fileType: parsedResume.fileType,
    textLength: parsedResume.text.length,
    text: parsedResume.text,
  });
}
