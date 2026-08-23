import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { InterviewSessionPlaceholderPage } from './pages/InterviewSessionPlaceholderPage';
import { InterviewSetupPage } from './pages/InterviewSetupPage';
import { LandingPage } from './pages/LandingPage';
import type { ParsedResume, ValidatedInterviewConfiguration } from './types/interview';

function App() {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [configuration, setConfiguration] = useState<ValidatedInterviewConfiguration | null>(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage resume={resume} onResumeParsed={setResume} />} />
        <Route
          path="/setup"
          element={<InterviewSetupPage resume={resume} onValidated={setConfiguration} />}
        />
        <Route
          path="/interview"
          element={<InterviewSessionPlaceholderPage configuration={configuration} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
