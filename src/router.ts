import {
  LLMProvider,
  LLMRequest,
  ProviderCallOptions,
  RoutedResult,
  RoutingRule,
  RoutingContext,
  RouterOptions,
} from './types';

export class LLMRouter {
  private providers: Map<string, LLMProvider> = new Map();
  private rules: RoutingRule[];
  private defaultProvider?: string;

  constructor(
    providers: LLMProvider[],
    rules: RoutingRule[] = [],
    options: RouterOptions = {}
  ) {
    providers.forEach((p) => this.providers.set(p.name, p));
    this.rules = rules;
    this.defaultProvider = options.defaultProvider;
  }

  registerProvider(provider: LLMProvider): void {
    this.providers.set(provider.name, provider);
  }

  registerRule(rule: RoutingRule): void {
    this.rules.push(rule);
  }

  async route(
    request: LLMRequest,
    ctxExtra: Record<string, unknown> = {},
    options?: ProviderCallOptions
  ): Promise<RoutedResult> {
    const ctx: RoutingContext = { request, tags: ctxExtra };
    let selectedRule: RoutingRule | undefined;
    for (const rule of this.rules) {
      const match = await rule.matches(ctx);
      if (match) {
        selectedRule = rule;
        break;
      }
    }
    const targetName =
      selectedRule?.targetProvider ?? this.defaultProvider;
    if (!targetName) {
      throw new Error(
        'No provider matched and no defaultProvider set'
      );
    }
    const provider = this.providers.get(targetName);
    if (!provider) {
      throw new Error(`Provider with name ${targetName} not found`);
    }
    const response = await provider.call(request, options);
    return {
      ...response,
      ruleName: selectedRule?.name ?? null,
    };
  }
}
