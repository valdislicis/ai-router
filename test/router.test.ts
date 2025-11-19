import { LLMRouter } from '../src/router';
import { LLMRequest, LLMResponse, LLMProvider } from '../src/types';

class DummyProvider implements LLMProvider {
  name: string;
  response: string;
  constructor(name: string, response: string) {
    this.name = name;
    this.response = response;
  }
  async call(request: LLMRequest): Promise<LLMResponse> {
    return {
      providerName: this.name,
      model: request.model || 'dummy-model',
      content: this.response,
      raw: {},
    };
  }
}

describe('LLMRouter', () => {
  let simpleProv: DummyProvider;
  let mediumProv: DummyProvider;
  let complexProv: DummyProvider;
  let router: LLMRouter;

  const simpleRule = {
    name: 'simple',
    targetProvider: 'simple',
    matches: (ctx: any) => ctx.request.messages[0].content === 'simple',
  };
  const mediumRule = {
    name: 'medium',
    targetProvider: 'medium',
    matches: (ctx: any) => ctx.request.messages[0].content === 'medium',
  };
  const complexRule = {
    name: 'complex',
    targetProvider: 'complex',
    matches: (ctx: any) => ctx.request.messages[0].content === 'complex',
  };

  beforeEach(() => {
    simpleProv = new DummyProvider('simple', 'simple-response');
    mediumProv = new DummyProvider('medium', 'medium-response');
    complexProv = new DummyProvider('complex', 'complex-response');
    router = new LLMRouter(
      [simpleProv, mediumProv, complexProv],
      [simpleRule, mediumRule, complexRule],
      { defaultProvider: 'medium' }
    );
  });

  it('routes to matching rule provider', async () => {
    const res = await router.route({
      messages: [{ role: 'user', content: 'simple' }],
    });
    expect(res.providerName).toBe('simple');
    expect(res.content).toBe('simple-response');
    expect(res.ruleName).toBe('simple');
  });

  it('uses first matching rule', async () => {
    const alwaysRule = {
      name: 'always',
      targetProvider: 'complex',
      matches: () => true,
    };
    router = new LLMRouter(
      [simpleProv, mediumProv, complexProv],
      [alwaysRule, simpleRule],
      { defaultProvider: 'medium' }
    );
    const res = await router.route({
      messages: [{ role: 'user', content: 'simple' }],
    });
    expect(res.providerName).toBe('complex');
    expect(res.ruleName).toBe('always');
  });

  it('uses defaultProvider when no rules match', async () => {
    const res = await router.route({
      messages: [{ role: 'user', content: 'none' }],
    });
    expect(res.providerName).toBe('medium');
    expect(res.ruleName).toBeNull();
  });

  it('throws when no defaultProvider and no rule matches', async () => {
    router = new LLMRouter([simpleProv], [], {});
    await expect(
      router.route({
        messages: [{ role: 'user', content: 'none' }],
      })
    ).rejects.toThrow('No provider matched');
  });

  it('throws when target provider is not registered', async () => {
    const badRule = {
      name: 'bad',
      targetProvider: 'unknown',
      matches: () => true,
    };
    router = new LLMRouter([], [badRule], {});
    await expect(
      router.route({
        messages: [{ role: 'user', content: 'anything' }],
      })
    ).rejects.toThrow('Provider with name unknown not found');
  });
});
