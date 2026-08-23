import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiRequestError,
  evaluateInterviewAnswer,
  generateNextInterviewQuestion,
  generateInterviewQuestion,
} from '../services/api';
import type {
  AnswerEvaluation,
  InterviewTurn,
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
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isPreparingNextQuestion, setIsPreparingNextQuestion] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [turnHistory, setTurnHistory] = useState<InterviewTurn[]>([]);
  const [lastEvaluation, setLastEvaluation] = useState<AnswerEvaluation | null>(null);
  const [isEnded, setIsEnded] = useState(false);

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

  async function submitAnswer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question || !answer.trim() || !configuration || !resume) {
      return;
    }

    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const result = await evaluateInterviewAnswer({
        question: question.question,
        answer: answer.trim(),
        targetRole: configuration.targetRole,
        experienceLevel: configuration.experienceLevel,
        interviewType: configuration.interviewType,
        difficulty: configuration.difficulty,
        resumeText: resume.text,
      });
      setEvaluation(result.evaluation);
      await prepareNextQuestion(result.evaluation);
    } catch (error) {
      setEvaluationError(
        error instanceof ApiRequestError ? error.message : 'The answer could not be evaluated.',
      );
    } finally {
      setIsEvaluating(false);
    }
  }

  async function prepareNextQuestion(currentEvaluation: AnswerEvaluation) {
    if (!question || !configuration || !resume) {
      return;
    }

    setIsPreparingNextQuestion(true);
    setEvaluationError(null);

    try {
      const result = await generateNextInterviewQuestion({
        resumeText: resume.text,
        targetRole: configuration.targetRole,
        ...(configuration.jobDescription ? { jobDescription: configuration.jobDescription } : {}),
        experienceLevel: configuration.experienceLevel,
        interviewType: configuration.interviewType,
        difficulty: configuration.difficulty,
        previousQuestion: question,
        previousAnswer: answer.trim(),
        evaluation: currentEvaluation,
      });

      setTurnHistory((history) => [
        ...history,
        { question, answer: answer.trim(), evaluation: currentEvaluation },
      ]);
      setLastEvaluation(currentEvaluation);
      setQuestion(result.question);
      setAnswer('');
      setEvaluation(null);
    } catch (error) {
      setEvaluationError(
        error instanceof ApiRequestError
          ? error.message
          : 'The next interview question could not be generated.',
      );
    } finally {
      setIsPreparingNextQuestion(false);
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

        {isEnded ? (
          <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Interview session ended</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Final report will be available in the next milestone.
            </p>
            <Link
              to="/setup"
              className="mt-5 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Start a new setup
            </Link>
          </section>
        ) : !question && !errorMessage ? (
          <div
            className="mt-10 rounded-lg bg-indigo-50 px-5 py-6 text-sm font-medium text-indigo-800"
            role="status"
          >
            Generating your first personalized interview question…
          </div>
        ) : null}

        {errorMessage && !isEnded && (
          <div className="mt-10 rounded-lg bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">
            {errorMessage}
          </div>
        )}

        {question && !isEnded && (
          <>
            {lastEvaluation && (
              <LastEvaluationSummary
                evaluation={lastEvaluation}
                questionNumber={turnHistory.length}
              />
            )}
            <section
              className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6"
              aria-labelledby="question-heading"
            >
              <p className="text-sm font-semibold text-indigo-600">
                Question {turnHistory.length + 1} · {question.topic}
              </p>
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
                  setEvaluation(null);
                  setEvaluationError(null);
                }}
                rows={9}
                placeholder="Write your answer here..."
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={!answer.trim() || isEvaluating || isPreparingNextQuestion}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isEvaluating ? 'Evaluating answer…' : 'Submit Answer'}
              </button>
            </form>

            {evaluationError && (
              <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {evaluationError}
              </p>
            )}

            {evaluation && <EvaluationResult evaluation={evaluation} />}

            {isPreparingNextQuestion && (
              <p
                className="mt-5 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-800"
                role="status"
              >
                Preparing your next question...
              </p>
            )}

            <button
              type="button"
              onClick={() => setIsEnded(true)}
              disabled={isEvaluating || isPreparingNextQuestion}
              className="mt-6 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              End Interview
            </button>
          </>
        )}
      </section>
    </main>
  );
}

function LastEvaluationSummary({
  evaluation,
  questionNumber,
}: {
  evaluation: AnswerEvaluation;
  questionNumber: number;
}) {
  return (
    <p className="mt-8 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
      Question {questionNumber} evaluation: {evaluation.overallScore}/100. A new adaptive question
      has been prepared from this feedback.
    </p>
  );
}

function EvaluationResult({ evaluation }: { evaluation: AnswerEvaluation }) {
  const scoreCards = [
    ['Technical Knowledge', evaluation.technicalKnowledge],
    ['Relevance', evaluation.relevance],
    ['Communication', evaluation.communication],
    ['Problem Solving', evaluation.problemSolving],
  ];

  return (
    <section className="mt-8 border-t border-slate-200 pt-8" aria-labelledby="evaluation-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-indigo-600">ANSWER EVALUATION</p>
          <h2 id="evaluation-heading" className="mt-1 text-2xl font-bold text-slate-900">
            Overall score: {evaluation.overallScore}/100
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {scoreCards.map(([label, score]) => (
          <div key={label} className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{score}/100</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm leading-6 text-slate-700">{evaluation.summary}</p>

      <FeedbackList title="Strengths" items={evaluation.strengths} tone="emerald" />
      <FeedbackList title="Improvements" items={evaluation.improvements} tone="amber" />
    </section>
  );
}

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'emerald' | 'amber';
}) {
  const toneClassName =
    tone === 'emerald' ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950';

  return (
    <section className={`mt-5 rounded-lg p-4 ${toneClassName}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
