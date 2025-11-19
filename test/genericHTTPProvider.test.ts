import fetch from 'cross-fetch';
import { GenericHTTPProvider } from '../src/providers/httpGeneric';
import { LLMRequest } from '../src/types';

jest.mock('cross-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('GenericHTTPProvider', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('calls fetch with correct parameters and parses choices', async () => {
    const fakeResponse = { choices: [{ message: { content: 'hello-gen' } }] };
    const mockRes: any = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue(fakeResponse),
    };
    mockFetch.mockResolvedValue(mockRes);
    const provider = new GenericHTTPProvider({
      name: 'gen',
      url: 'http://test-gen',
      apiKeyHeader: 'X-API-KEY',
      apiKey: 'key',
    });
    const request: LLMRequest = {
      messages: [{ role: 'assistant', content: 'assist' }],
      maxTokens: 100,
    };
    const res = await provider.call(request);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-gen',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': 'key' },
      })
    );
    expect(res.content).toBe('hello-gen');
  });

  it('parses fallback content', async () => {
    const fakeResponse = { content: 'fallback' };
    const mockRes: any = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue(fakeResponse),
    };
    mockFetch.mockResolvedValue(mockRes);
    const provider = new GenericHTTPProvider({
      name: 'gen2',
      url: 'http://test-gen2',
    });
    const res = await provider.call({ messages: [] });
    expect(res.content).toBe('fallback');
  });
});
