import { extname } from 'node:path';
import type { ParsedResume, ResumeFileType } from '../types/resume.js';
import { ApiError } from '../utils/api-error.js';
import { extractResumeText } from './resume-parser.service.js';

const supportedMimeTypes: Record<ResumeFileType, ReadonlySet<string>> = {
  pdf: new Set(['application/pdf']),
  docx: new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
};

const fileTypeByExtension: Record<string, ResumeFileType> = {
  '.pdf': 'pdf',
  '.docx': 'docx',
};

function hasPdfSignature(buffer: Buffer): boolean {
  return buffer.subarray(0, 4).toString('ascii') === '%PDF';
}

function hasZipSignature(buffer: Buffer): boolean {
  if (buffer.length < 4) {
    return false;
  }

  return (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    [0x03, 0x05, 0x07].includes(buffer[2]!) &&
    [0x04, 0x06, 0x08].includes(buffer[3]!)
  );
}

function getResumeFileType(file: Express.Multer.File): ResumeFileType {
  const extension = extname(file.originalname).toLowerCase();
  const fileType = fileTypeByExtension[extension];

  if (!fileType) {
    throw new ApiError(
      415,
      'UNSUPPORTED_FILE_TYPE',
      'Only PDF and DOCX resume files are supported.',
    );
  }

  const isGenericMimeType = !file.mimetype || file.mimetype === 'application/octet-stream';
  if (!isGenericMimeType && !supportedMimeTypes[fileType].has(file.mimetype)) {
    throw new ApiError(
      415,
      'UNSUPPORTED_FILE_TYPE',
      'The uploaded file type does not match its filename.',
    );
  }

  const hasExpectedSignature =
    fileType === 'pdf' ? hasPdfSignature(file.buffer) : hasZipSignature(file.buffer);
  if (!hasExpectedSignature) {
    throw new ApiError(
      415,
      'INVALID_FILE_CONTENT',
      'The uploaded file content does not match a valid resume format.',
    );
  }

  return fileType;
}

export async function parseResume(file: Express.Multer.File): Promise<ParsedResume> {
  if (file.size === 0 || file.buffer.length === 0) {
    throw new ApiError(400, 'EMPTY_FILE', 'The uploaded resume file is empty.');
  }

  const fileType = getResumeFileType(file);
  const text = await extractResumeText(fileType, file.buffer);

  return {
    filename: file.originalname,
    fileType,
    text,
  };
}
