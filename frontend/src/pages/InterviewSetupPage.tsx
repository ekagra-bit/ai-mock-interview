import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInterviewSetup } from '../hooks/useInterviewSetup';
import { ApiRequestError, setupInterview } from '../services/api';
import {
  DIFFICULTIES,
  EXPERIENCE_LEVELS,
  INTERVIEW_TYPES,
  type ParsedResume,
  type ValidatedInterviewConfiguration,
} from '../types/interview';
import { isCompleteInterviewSetup } from '../utils/interview-setup';

interface InterviewSetupPageProps {
  resume: ParsedResume | null;
  onValidated: (configuration: ValidatedInterviewConfiguration) => void;
}

export function InterviewSetupPage({ resume, onValidated }: InterviewSetupPageProps) {
  const navigate = useNavigate();
  const { values, setValues, isReady } = useInterviewSetup(resume);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resume || !isCompleteInterviewSetup(values)) {
      setErrorMessage('Upload a resume and complete all required fields before continuing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await setupInterview({
        resumeFilename: resume.filename,
        resumeText: resume.text,
        targetRole: values.targetRole.trim(),
        ...(values.jobDescription.trim() ? { jobDescription: values.jobDescription.trim() } : {}),
        experienceLevel: values.experienceLevel,
        interviewType: values.interviewType,
        difficulty: values.difficulty,
      });
      onValidated(result.configuration);
      navigate('/interview');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError
          ? error.message
          : 'The interview setup could not be validated.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 sm:py-16">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold tracking-wide text-indigo-600">JOBLUXE</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          AI Mock Interview Setup
        </h1>
        <p className="mt-3 text-slate-600">
          Configure your interview. Questions will be added in a later milestone.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <section
            className="rounded-lg border border-slate-200 p-4"
            aria-labelledby="resume-heading"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="resume-heading" className="font-semibold text-slate-900">
                  Resume
                </h2>
                {resume ? (
                  <>
                    <p className="mt-1 text-sm text-slate-700">{resume.filename}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {resume.textLength.toLocaleString()} characters extracted
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-red-700">
                    A parsed resume is required before setup.
                  </p>
                )}
              </div>
              <Link to="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                {resume ? 'Replace resume' : 'Upload resume'}
              </Link>
            </div>
          </section>

          <FormField label="Target role / technology" htmlFor="target-role" required>
            <input
              id="target-role"
              value={values.targetRole}
              onChange={(event) => setValues({ ...values, targetRole: event.target.value })}
              placeholder="Software Engineer"
              maxLength={120}
              required
              className={inputClassName}
            />
          </FormField>

          <FormField label="Job description" htmlFor="job-description" optional>
            <textarea
              id="job-description"
              value={values.jobDescription}
              onChange={(event) => setValues({ ...values, jobDescription: event.target.value })}
              maxLength={10000}
              rows={6}
              placeholder="Paste a job description to tailor a future interview."
              className={inputClassName}
            />
          </FormField>

          <FormField label="Experience level" htmlFor="experience-level" required>
            <select
              id="experience-level"
              value={values.experienceLevel}
              onChange={(event) =>
                setValues({
                  ...values,
                  experienceLevel: event.target.value as typeof values.experienceLevel,
                })
              }
              required
              className={inputClassName}
            >
              <option value="">Select experience level</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Interview type" htmlFor="interview-type" required>
            <select
              id="interview-type"
              value={values.interviewType}
              onChange={(event) =>
                setValues({
                  ...values,
                  interviewType: event.target.value as typeof values.interviewType,
                })
              }
              required
              className={inputClassName}
            >
              <option value="">Select interview type</option>
              {INTERVIEW_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Difficulty" htmlFor="difficulty" required>
            <select
              id="difficulty"
              value={values.difficulty}
              onChange={(event) =>
                setValues({ ...values, difficulty: event.target.value as typeof values.difficulty })
              }
              required
              className={inputClassName}
            >
              <option value="">Select difficulty</option>
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty}>{difficulty}</option>
              ))}
            </select>
          </FormField>

          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!isReady || isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Validating setup…' : 'Start Interview'}
          </button>
        </form>
      </section>
    </main>
  );
}

const inputClassName =
  'mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}

function FormField({ label, htmlFor, required, optional, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-800">
        {label} {required && <span className="text-red-600">*</span>}
        {optional && <span className="font-normal text-slate-500">(Optional)</span>}
      </label>
      {children}
    </div>
  );
}
