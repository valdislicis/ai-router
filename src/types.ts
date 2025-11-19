export type Role = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface LLMRequest {
  model?: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  metadata?: Record<string, unknown>;
}

export interface LLMResponse {
  providerName: string;
  model: string;
  content: string;
  raw?: unknown;
}

export interface ProviderCallOptions {
  signal?: AbortSignal;
  extra?: Record<string, unknown>;
}

export interface LLMProvider {
  name: string;
  call(request: LLMRequest, options?: ProviderCallOptions): Promise<LLMResponse>;
}

export interface RoutingContext {
  request: LLMRequest;
  tags: Record<string, unknown>;
}

export interface RoutingRule {
  name: string;
  matches(ctx: RoutingContext): boolean | Promise<boolean>;
  targetProvider: string;
}

export interface RouterOptions {
  defaultProvider?: string;
}

export interface RoutedResult extends LLMResponse {
  ruleName: string | null;
}
