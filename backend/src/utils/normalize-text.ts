export function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/\f/g, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => !/^-- \d+ of \d+ --$/.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
