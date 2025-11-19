import fetch from 'cross-fetch';
import {
  LLMProvider,
  LLMRequest,
  ProviderCallOptions,
  LLMResponse,
} from '../types';

export interface OllamaProviderConfig {
  model?: string;
  baseUrl?: string;
}

export class OllamaProvider implements LLMProvider {
  public name = 'ollama';
  private model: string;
  private baseUrl: string;

  constructor(config: OllamaProviderConfig = {}) {
    this.model = config.model ?? 'llama3';
    this.baseUrl = config.baseUrl ?? 'http://localhost:11434';
  }

  async call(
    request: LLMRequest,
    options?: ProviderCallOptions
  ): Promise<LLMResponse> {
    const model = request.model ?? this.model;
    const prompt = request.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    const body: any = {
      model,
      prompt,
      stream: false,
      options: {},
    };
    if (request.temperature !== undefined) {
      body.options.temperature = request.temperature;
    }
    const response = await fetch(
      `${this.baseUrl}/api/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: options?.signal,
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `OllamaProvider error: ${response.status} ${response.statusText} - ${text}`
      );
    }
    const json = await response.json();
    const content = json.response;
    return {
      providerName: this.name,
      model,
      content,
      raw: json,
    };
  }
}
