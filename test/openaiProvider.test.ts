import fetch from 'cross-fetch';
import { OpenAIProvider } from '../src/providers/openai';
import { LLMRequest } from '../src/types';

jest.mock('cross-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('OpenAIProvider', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('calls fetch with correct parameters and returns parsed response', async () => {
    const fakeResponse = { choices: [{ message: { content: 'hello' } }] };
    const mockRes: any = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue(fakeResponse),
    };
    mockFetch.mockResolvedValue(mockRes);
    const provider = new OpenAIProvider({
      apiKey: 'test-key',
      model: 'test-model',
      baseUrl: 'https://api.test',
    });
    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'test' }],
    };
    const res = await provider.call(request);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-key',
        },
        body: JSON.stringify({
          model: 'test-model',
          messages: request.messages,
        }),
        signal: undefined,
      })
    );
    expect(res.content).toBe('hello');
    expect(res.providerName).toBe('openai');
    expect(res.model).toBe('test-model');
    expect(res.raw).toEqual(fakeResponse);
  });

  it('throws error on non-ok response', async () => {
    const mockRes: any = {
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: jest.fn().mockResolvedValue('error'),
    };
    mockFetch.mockResolvedValue(mockRes);
    const provider = new OpenAIProvider({ apiKey: 'key' });
    await expect(
      provider.call({ messages: [{ role: 'user', content: 'hi' }] })
    ).rejects.toThrow('OpenAIProvider error: 401 Unauthorized - error');
  });
});
