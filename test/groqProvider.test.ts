import fetch from 'cross-fetch';
import { GroqProvider } from '../src/providers/groq';
import { LLMRequest } from '../src/types';

jest.mock('cross-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('GroqProvider', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('calls fetch with correct parameters and returns parsed response', async () => {
    const fakeResponse = { choices: [{ delta: { content: 'groq' } }] };
    const mockRes: any = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue(fakeResponse),
    };
    mockFetch.mockResolvedValue(mockRes);
    const provider = new GroqProvider({ apiKey: 'groq-key' });
    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'test' }],
    };
    const res = await provider.call(request);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer groq-key',
        },
      })
    );
    expect(res.content).toBe('groq');
    expect(res.providerName).toBe('groq');
    expect(res.model).toBe('llama-3.1-70b-versatile');
  });
});
