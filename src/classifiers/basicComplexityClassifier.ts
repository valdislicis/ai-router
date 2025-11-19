import { LLMRequest } from '../types';

export type ComplexityLevel = 'simple' | 'medium' | 'complex';

export function basicComplexityClassifier(
  request: LLMRequest
): ComplexityLevel {
  const text = request.messages.map((m) => m.content).join(' ');
  const length = text.length;
  const keywords = [
    'architecture',
    'system design',
    'debug',
    'optimize',
    'refactor',
    'security',
    'scalability',
  ];
  const lower = text.toLowerCase();
  const hasKeyword = keywords.some((kw) => lower.includes(kw));
  if (length < 400 && !hasKeyword) {
    return 'simple';
  }
  if (length > 2500 || hasKeyword) {
    return 'complex';
  }
  return 'medium';
}
