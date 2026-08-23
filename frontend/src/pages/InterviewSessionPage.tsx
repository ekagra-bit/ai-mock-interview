import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiRequestError, generateInterviewQuestion } from '../services/api';
import type {
  InterviewQuestion,
  ParsedResume,
  ValidatedInterviewConfiguration,
} from '../types/interview';

interface InterviewSessionPageProps {
  configuration: ValidatedInterviewConfiguration | null;
  resume: ParsedResume | null;
}

export function InterviewSessionPage({ configuration, resume }: InterviewSessionPageProps) {
  const hasRequestedQuestion = useRef(false);
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  useEffect(() => {
    if (!configuration || !resume || hasRequestedQuestion.current) {
      return;
    }

    hasRequestedQuestion.current = true;
    void generateInterviewQuestion({
      resumeText: resume.text,
      targetRole: configuration.targetRole,
      ...(configuration.jobDescription ? { jobDescription: configuration.jobDescription } : {}),
      experienceLevel: configuration.experienceLevel,
      interviewType: configuration.interviewType,
      difficulty: configuration.difficulty,
    })
      .then((result) => setQuestion(result.question))
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof ApiRequestError
            ? error.message
            : 'The first interview question could not be generated.',
        );
      });
  }, [configuration, resume]);

  if (!configuration || !resume) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Interview setup required</h1>
          <p className="mt-3 text-slate-600">
            Upload a resume and complete the setup before starting an interview.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Return to resume upload
          </Link>
        </section>
      </main>
    );
  }

  function submitAnswer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (answer.trim()) {
      setAnswerSubmitted(true);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 sm:py-16">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold tracking-wide text-indigo-600">JOBLUXE</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Mock Interview</h1>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {configuration.targetRole}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {configuration.interviewType}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {configuration.difficulty}
          </span>
        </div>

        {!question && !errorMessage && (
          <div
            className="mt-10 rounded-lg bg-indigo-50 px-5 py-6 text-sm font-medium text-indigo-800"
            role="status"
          >
            Generating your first personalized interview question…
          </div>
        )}

        {errorMessage && (
          <div className="mt-10 rounded-lg bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">
            {errorMessage}
          </div>
        )}

        {question && (
          <>
            <section
              className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6"
              aria-labelledby="question-heading"
            >
              <p className="text-sm font-semibold text-indigo-600">{question.topic}</p>
              <h2
                id="question-heading"
                className="mt-3 text-xl font-semibold leading-8 text-slate-900"
              >
                {question.question}
              </h2>
            </section>

            <form className="mt-7" onSubmit={submitAnswer}>
              <label htmlFor="answer" className="text-sm font-semibold text-slate-800">
                Your answer
              </label>
              <textarea
                id="answer"
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setAnswerSubmitted(false);
                }}
                rows={9}
                placeholder="Write your answer here..."
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={!answer.trim()}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Submit Answer
              </button>
            </form>

            {answerSubmitted && (
              <p
                className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800"
                role="status"
              >
                Answer evaluation will be added in the next milestone.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
