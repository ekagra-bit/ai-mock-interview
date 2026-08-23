import { useRef, useState } from 'react';
import { ApiRequestError, parseResume, type ParsedResumeResponse } from '../services/api';

interface ResumeUploadProps {
  onParsed: (resume: ParsedResumeResponse) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const acceptedTypes =
  '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function ResumeUpload({ onParsed }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResumeResponse | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setStatus('idle');
    setErrorMessage(null);
    setParsedResume(null);
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setStatus('error');
      setErrorMessage('Choose a PDF or DOCX resume before uploading.');
      return;
    }

    setStatus('uploading');
    setErrorMessage(null);

    try {
      const result = await parseResume(file);
      setParsedResume(result);
      onParsed(result);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'The resume could not be processed.',
      );
    }
  }

  return (
    <section className="mt-10 border-t border-slate-200 pt-8" aria-labelledby="resume-upload-title">
      <h2 id="resume-upload-title" className="text-xl font-semibold text-slate-900">
        Upload your resume
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Upload a PDF or DOCX file to extract its text for a future personalized interview. Files are
        processed in memory and are not saved.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleUpload}>
        <label className="block">
          <span className="sr-only">Choose a PDF or DOCX resume</span>
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            disabled={status === 'uploading'}
            className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 disabled:cursor-not-allowed"
          />
        </label>

        {file && <p className="text-sm text-slate-600">Selected: {file.name}</p>}

        <button
          type="submit"
          disabled={!file || status === 'uploading'}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {status === 'uploading' ? 'Extracting resume text…' : 'Upload and extract text'}
        </button>
      </form>

      {errorMessage && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      {parsedResume && status === 'success' && (
        <div className="mt-5 rounded-lg bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">
            Text extracted from {parsedResume.filename} ({parsedResume.textLength.toLocaleString()}{' '}
            characters)
          </p>
          <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-md border border-emerald-100 bg-white p-3 font-sans text-sm leading-6 text-slate-700">
            {parsedResume.text}
          </pre>
        </div>
      )}
    </section>
  );
}
