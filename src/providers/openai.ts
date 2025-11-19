import fetch from 'cross-fetch';
import {
  LLMProvider,
  LLMRequest,
  ProviderCallOptions,
  LLMResponse,
} from '../types';

export interface OpenAIProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export class OpenAIProvider implements LLMProvider {
  public name = 'openai';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: OpenAIProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? 'gpt-4';
    this.baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
  }

  async call(
    request: LLMRequest,
    options?: ProviderCallOptions
  ): Promise<LLMResponse> {
    const model = request.model ?? this.model;
    const body: any = { model, messages: request.messages };
    if (request.maxTokens !== undefined) {
      body.max_tokens = request.maxTokens;
    }
    if (request.temperature !== undefined) {
      body.temperature = request.temperature;
    }
    if (request.topP !== undefined) {
      body.top_p = request.topP;
    }
    const response = await fetch(
      `${this.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: options?.signal,
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `OpenAIProvider error: ${response.status} ${response.statusText} - ${text}`
      );
    }
    const json = await response.json();
    let content = '';
    if (json.choices && json.choices.length > 0) {
      const choice = json.choices[0];
      if (choice.message && choice.message.content) {
        content = choice.message.content;
      } else if (choice.delta && choice.delta.content) {
        content = choice.delta.content;
      }
    }
    return {
      providerName: this.name,
      model,
      content,
      raw: json,
    };
  }
}
