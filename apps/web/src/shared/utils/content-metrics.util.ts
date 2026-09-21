export function countWords(content: string): number {
  const normalized = content.trim();
  return normalized ? normalized.split(/\s+/u).length : 0;
}

export function estimateReadingMinutes(content: string, wordsPerMinute = 170): number {
  return Math.max(1, Math.ceil(countWords(content) / wordsPerMinute));
}
