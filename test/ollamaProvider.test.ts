import fetch from 'cross-fetch';
import { OllamaProvider } from '../src/providers/ollama';
import { LLMRequest } from '../src/types';

jest.mock('cross-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('OllamaProvider', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('calls fetch with correct parameters and returns parsed response', async () => {
    const fakeJson = { response: 'ollama-response' };
    const mockRes: any = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue(fakeJson),
    };
    mockFetch.mockResolvedValue(mockRes);
    const provider = new OllamaProvider({ baseUrl: 'http://test-ollama' });
    const request: LLMRequest = {
      messages: [
        { role: 'system', content: 'sys' },
        { role: 'user', content: 'user' },
      ],
      temperature: 0.7,
    };
    const res = await provider.call(request);
    const expectedPrompt = 'SYSTEM: sys\n\nUSER: user';
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-ollama/api/generate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: expectedPrompt,
          stream: false,
          options: { temperature: 0.7 },
        }),
      })
    );
    expect(res.content).toBe('ollama-response');
    expect(res.providerName).toBe('ollama');
  });
});
