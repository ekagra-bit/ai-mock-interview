import 'dotenv/config';

const defaultClientOrigin = 'http://localhost:5173';

function parsePort(value: string | undefined): number {
  const port = Number(value ?? 5000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

export const env = {
  port: parsePort(process.env.PORT),
  geminiApiKey: process.env.GEMINI_API_KEY?.trim(),
  clientOrigins: (process.env.CLIENT_ORIGIN ?? defaultClientOrigin)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
