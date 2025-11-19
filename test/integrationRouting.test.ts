import { LLMRouter } from '../src/index';
import { basicComplexityClassifier } from '../src/classifiers/basicComplexityClassifier';
import { LLMRequest, LLMProvider, LLMResponse } from '../src/types';

class DummyProvider implements LLMProvider {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  async call(request: LLMRequest): Promise<LLMResponse> {
    return {
      providerName: this.name,
      model: 'm',
      content: this.name,
      raw: {},
    };
  }
}

describe('Integration: LLMRouter with basicComplexityClassifier', () => {
  const simpleProvider = new DummyProvider('simple');
  const mediumProvider = new DummyProvider('medium');
  const complexProvider = new DummyProvider('complex');
  const rules = [
    {
      name: 'simple-rule',
      targetProvider: 'simple',
      matches: (ctx: any) =>
        basicComplexityClassifier(ctx.request) === 'simple',
    },
    {
      name: 'medium-rule',
      targetProvider: 'medium',
      matches: (ctx: any) =>
        basicComplexityClassifier(ctx.request) === 'medium',
    },
    {
      name: 'complex-rule',
      targetProvider: 'complex',
      matches: (ctx: any) =>
        basicComplexityClassifier(ctx.request) === 'complex',
    },
  ];
  const router = new LLMRouter(
    [simpleProvider, mediumProvider, complexProvider],
    rules,
    { defaultProvider: 'complex' }
  );

  it('routes simple requests to simple provider', async () => {
    const res = await router.route({
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(res.providerName).toBe('simple');
    expect(res.ruleName).toBe('simple-rule');
  });

  it('routes medium requests to medium provider', async () => {
    const text = 'a'.repeat(1000);
    const res = await router.route({
      messages: [{ role: 'user', content: text }],
    });
    expect(res.providerName).toBe('medium');
    expect(res.ruleName).toBe('medium-rule');
  });

  it('routes complex requests to complex provider', async () => {
    const text = 'optimize ' + 'a'.repeat(10);
    const res = await router.route({
      messages: [{ role: 'user', content: text }],
    });
    expect(res.providerName).toBe('complex');
    expect(res.ruleName).toBe('complex-rule');
  });
});
