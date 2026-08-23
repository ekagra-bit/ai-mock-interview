import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import type { ResumeFileType } from '../types/resume.js';
import { ApiError } from '../utils/api-error.js';
import { normalizeExtractedText } from '../utils/normalize-text.js';

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return normalizeExtractedText(result.text);
  } catch {
    throw new ApiError(
      422,
      'RESUME_PARSING_FAILED',
      'The PDF could not be read. Please upload a valid PDF.',
    );
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeExtractedText(result.value);
  } catch {
    throw new ApiError(
      422,
      'RESUME_PARSING_FAILED',
      'The DOCX file could not be read. Please upload a valid DOCX file.',
    );
  }
}

export async function extractResumeText(fileType: ResumeFileType, buffer: Buffer): Promise<string> {
  const text = fileType === 'pdf' ? await extractPdfText(buffer) : await extractDocxText(buffer);

  if (text.length === 0) {
    const message =
      fileType === 'pdf'
        ? 'No readable text was found in this PDF. Scanned-image PDFs are not supported.'
        : 'No readable text was found in this DOCX file.';

    throw new ApiError(422, 'NO_EXTRACTABLE_TEXT', message);
  }

  return text;
}
