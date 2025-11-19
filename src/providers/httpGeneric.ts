import fetch from 'cross-fetch';
import {
  LLMProvider,
  LLMRequest,
  ProviderCallOptions,
  LLMResponse,
} from '../types';

export interface GenericHTTPProviderConfig {
  name: string;
  url: string;
  apiKeyHeader?: string;
  apiKey?: string;
  defaultModel?: string;
  method?: 'POST' | 'PUT';
}

export class GenericHTTPProvider implements LLMProvider {
  public name: string;
  private url: string;
  private apiKeyHeader?: string;
  private apiKey?: string;
  private defaultModel?: string;
  private method: 'POST' | 'PUT';

  constructor(config: GenericHTTPProviderConfig) {
    this.name = config.name;
    this.url = config.url;
    this.apiKeyHeader = config.apiKeyHeader;
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel;
    this.method = config.method ?? 'POST';
  }

  async call(
    request: LLMRequest,
    options?: ProviderCallOptions
  ): Promise<LLMResponse> {
    const model =
      request.model ?? this.defaultModel ?? 'default';
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKeyHeader && this.apiKey) {
      headers[this.apiKeyHeader] = this.apiKey;
    }
    const response = await fetch(this.url, {
      method: this.method,
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `GenericHTTPProvider error: ${response.status} ${response.statusText} - ${text}`
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
    } else if (json.content) {
      content = json.content;
    }
    return {
      providerName: this.name,
      model,
      content,
      raw: json,
    };
  }
}
