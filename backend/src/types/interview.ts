export const EXPERIENCE_LEVELS = ['Fresher', 'Junior', 'Mid-Level', 'Senior'] as const;
export const INTERVIEW_TYPES = ['Technical', 'HR', 'Mixed'] as const;
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type InterviewType = (typeof INTERVIEW_TYPES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export const QUESTION_CATEGORIES = ['technical', 'behavioral', 'problem-solving', 'hr'] as const;
export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number];

export interface InterviewSetupRequest {
  resumeFilename: string;
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
}

export interface InterviewSetupConfiguration {
  resumeFilename: string;
  targetRole: string;
  jobDescription?: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
}

export interface InterviewSetupResponse {
  success: true;
  message: 'Interview setup validated successfully';
  configuration: InterviewSetupConfiguration;
}

export interface InterviewQuestionRequest {
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
}

export interface InterviewQuestion {
  question: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  topic: string;
}

export interface InterviewQuestionResponse {
  success: true;
  question: InterviewQuestion;
}
