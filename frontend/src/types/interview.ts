export const EXPERIENCE_LEVELS = ['Fresher', 'Junior', 'Mid-Level', 'Senior'] as const;
export const INTERVIEW_TYPES = ['Technical', 'HR', 'Mixed'] as const;
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type InterviewType = (typeof INTERVIEW_TYPES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type QuestionCategory = 'technical' | 'behavioral' | 'problem-solving' | 'hr';

export interface ParsedResume {
  filename: string;
  fileType: 'pdf' | 'docx';
  textLength: number;
  text: string;
}

export interface InterviewSetupFormValues {
  targetRole: string;
  jobDescription: string;
  experienceLevel: ExperienceLevel | '';
  interviewType: InterviewType | '';
  difficulty: Difficulty | '';
}

export interface InterviewSetupRequest {
  resumeFilename: string;
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
}

export interface ValidatedInterviewConfiguration {
  resumeFilename: string;
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

export interface InterviewQuestionRequest {
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
}

export interface AnswerEvaluation {
  overallScore: number;
  technicalKnowledge: number;
  relevance: number;
  communication: number;
  problemSolving: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

export interface AnswerEvaluationRequest {
  question: string;
  answer: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  resumeText?: string;
}
