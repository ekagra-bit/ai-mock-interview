import { useMemo, useState } from 'react';
import type { InterviewSetupFormValues, ParsedResume } from '../types/interview';
import { isCompleteInterviewSetup } from '../utils/interview-setup';

const initialValues: InterviewSetupFormValues = {
  targetRole: '',
  jobDescription: '',
  experienceLevel: '',
  interviewType: '',
  difficulty: '',
};

export function useInterviewSetup(resume: ParsedResume | null) {
  const [values, setValues] = useState<InterviewSetupFormValues>(initialValues);

  const isReady = useMemo(
    () => Boolean(resume && isCompleteInterviewSetup(values)),
    [resume, values],
  );

  return { values, setValues, isReady };
}
