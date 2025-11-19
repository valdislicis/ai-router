# ai-router

Pluggable LLM routing layer with multiple providers (OpenAI, Groq, Ollama, Generic HTTP) and rule-based routing.

## Installation

```bash
npm install ai-router
```

```bash
yarn add ai-router
```

## Usage

```typescript
import {
  LLMRouter,
  OpenAIProvider,
  GroqProvider,
  OllamaProvider,
  basicComplexityClassifier,
} from 'ai-router';

const openai = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4.1',
});

const groq = new GroqProvider({
  apiKey: process.env.GROQ_API_KEY!,
  model: 'llama-3.1-70b-versatile',
});

const ollama = new OllamaProvider({
  model: 'llama3',
  baseUrl: 'http://localhost:11434',
});

const router = new LLMRouter(
  [openai, groq, ollama],
  [
    {
      name: 'simple-to-ollama',
      targetProvider: 'ollama',
      matches: (ctx) => basicComplexityClassifier(ctx.request) === 'simple',
    },
    {
      name: 'medium-to-groq',
      targetProvider: 'groq',
      matches: (ctx) => basicComplexityClassifier(ctx.request) === 'medium',
    },
    {
      name: 'complex-to-openai',
      targetProvider: 'openai',
      matches: (ctx) => basicComplexityClassifier(ctx.request) === 'complex',
    },
  ],
  { defaultProvider: 'openai' }
);

async function main() {
  const res = await router.route({
    messages: [{ role: 'user', content: 'Explain clean architecture in Node.js.' }],
  });
  console.log('Provider:', res.providerName);
  console.log('Rule:', res.ruleName);
  console.log('Content:', res.content);
}

main().catch(console.error);
