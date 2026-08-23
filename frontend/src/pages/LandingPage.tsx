import { useEffect, useState } from 'react';
import { ResumeUpload } from '../components/ResumeUpload';
import { getHealth } from '../services/api';

type HealthStatus = 'checking' | 'connected' | 'unavailable';

const statusMessage: Record<HealthStatus, string> = {
  checking: 'Checking the API connection…',
  connected: 'Frontend is running and connected to the API.',
  unavailable: 'Frontend is running. The API is not reachable yet.',
};

export function LandingPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('checking');

  useEffect(() => {
    void getHealth()
      .then(() => setHealthStatus('connected'))
      .catch(() => setHealthStatus('unavailable'));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="mb-4 text-sm font-semibold tracking-wide text-indigo-600">JOBLUXE</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">AI Mock Interview</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Upload a resume to extract its readable text.
        </p>
        <p
          className={`mt-8 rounded-lg px-4 py-3 text-sm font-medium ${
            healthStatus === 'connected'
              ? 'bg-emerald-50 text-emerald-700'
              : healthStatus === 'unavailable'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-slate-100 text-slate-600'
          }`}
          role="status"
        >
          {statusMessage[healthStatus]}
        </p>
        <ResumeUpload />
      </section>
    </main>
  );
}
