export type ResumeFileType = 'pdf' | 'docx';

export interface ParsedResume {
  filename: string;
  fileType: ResumeFileType;
  text: string;
}
