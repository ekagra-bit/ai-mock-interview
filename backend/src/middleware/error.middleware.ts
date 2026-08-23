import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { ApiError } from '../utils/api-error.js';
import { MAX_RESUME_FILE_SIZE_BYTES } from './upload.middleware.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message },
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    const isFileTooLarge = error.code === 'LIMIT_FILE_SIZE';
    response.status(isFileTooLarge ? 413 : 400).json({
      success: false,
      error: {
        code: isFileTooLarge ? 'FILE_TOO_LARGE' : 'INVALID_UPLOAD',
        message: isFileTooLarge
          ? `Resume files must be ${MAX_RESUME_FILE_SIZE_BYTES / (1024 * 1024)} MB or smaller.`
          : 'Upload exactly one file using the "file" field.',
      },
    });
    return;
  }

  response.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'The resume could not be processed. Please try again.',
    },
  });
};
