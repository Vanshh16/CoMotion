const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5';

if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set. LLM calls will fail until you set it.');
}

async function callLLM(prompt) {
  // uses Chat Completions endpoint (OpenAI-compatible)
  const url = 'https://api.openai.com/v1/chat/completions';
  const body = {
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are a JSON-output-only parser/reranker. Return JSON only.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 600
  };

  const resp = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 20000
  });

  // return assistant content
  return resp.data.choices[0].message.content;
}

module.exports = { callLLM };
