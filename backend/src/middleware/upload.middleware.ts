import multer from 'multer';

export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_FILE_SIZE_BYTES,
    files: 1,
  },
});
