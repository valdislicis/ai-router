import { basicComplexityClassifier } from '../src/classifiers/basicComplexityClassifier';
import { LLMRequest } from '../src/types';

describe('basicComplexityClassifier', () => {
  it('returns simple for short text without keywords', () => {
    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'Hello world' }],
    };
    expect(basicComplexityClassifier(request)).toBe('simple');
  });

  it('returns complex for text containing keyword', () => {
    const request: LLMRequest = {
      messages: [
        {
          role: 'user',
          content:
            'I want to optimize this system architecture for scalability and security',
        },
      ],
    };
    expect(basicComplexityClassifier(request)).toBe('complex');
  });

  it('returns complex for long text', () => {
    const longText = 'a'.repeat(3000);
    const request: LLMRequest = {
      messages: [{ role: 'user', content: longText }],
    };
    expect(basicComplexityClassifier(request)).toBe('complex');
  });

  it('returns medium for intermediate cases', () => {
    const text = 'a'.repeat(1000);
    const request: LLMRequest = {
      messages: [{ role: 'user', content: text }],
    };
    expect(basicComplexityClassifier(request)).toBe('medium');
  });
});
