import { GeminiProviderError, testGeminiConnectivity } from '../ai/gemini.provider.js';

try {
  const response = await testGeminiConnectivity();
  console.log(response);
} catch (error) {
  const message =
    error instanceof GeminiProviderError
      ? `${error.code}: ${error.message}`
      : 'Gemini connectivity test failed unexpectedly.';

  console.error(message);
  process.exitCode = 1;
}
