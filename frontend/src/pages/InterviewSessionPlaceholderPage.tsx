import { Link } from 'react-router-dom';
import type { ValidatedInterviewConfiguration } from '../types/interview';

interface InterviewSessionPlaceholderPageProps {
  configuration: ValidatedInterviewConfiguration | null;
}

export function InterviewSessionPlaceholderPage({
  configuration,
}: InterviewSessionPlaceholderPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-wide text-indigo-600">JOBLUXE</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Interview setup complete</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Your {configuration?.interviewType ?? 'mock'} interview configuration is validated.
          AI-generated questions will be added in the next milestone.
        </p>
        {configuration && (
          <dl className="mt-6 space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex justify-between gap-4">
              <dt>Role</dt>
              <dd className="font-medium text-right">{configuration.targetRole}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Experience</dt>
              <dd className="font-medium">{configuration.experienceLevel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Difficulty</dt>
              <dd className="font-medium">{configuration.difficulty}</dd>
            </div>
          </dl>
        )}
        <Link
          to="/setup"
          className="mt-6 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Back to setup
        </Link>
      </section>
    </main>
  );
}
