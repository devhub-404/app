export function isFeedbackDescriptionValid(description: string): boolean {
  const normalized = description.trim();
  return normalized.length >= 10 && normalized.length <= 4000;
}
