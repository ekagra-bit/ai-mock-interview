import {
  DIFFICULTIES,
  EXPERIENCE_LEVELS,
  INTERVIEW_TYPES,
  type Difficulty,
  type ExperienceLevel,
  type InterviewSetupFormValues,
  type InterviewType,
} from '../types/interview';

type CompleteInterviewSetupFormValues = InterviewSetupFormValues & {
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
};

export function isCompleteInterviewSetup(
  values: InterviewSetupFormValues,
): values is CompleteInterviewSetupFormValues {
  return (
    values.targetRole.trim().length > 0 &&
    EXPERIENCE_LEVELS.includes(values.experienceLevel as ExperienceLevel) &&
    INTERVIEW_TYPES.includes(values.interviewType as InterviewType) &&
    DIFFICULTIES.includes(values.difficulty as Difficulty)
  );
}
