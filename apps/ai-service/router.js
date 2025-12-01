import { Router } from 'express';
import { parseQuery } from './parser.js';
import { runAgent } from './agent.js';

const router = Router();

// --- SPRINT B ROUTE (Parser Testing) ---
router.post('/parse', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Missing "text" field in body' });
  }

  try {
    const parsedQuery = await parseQuery(text);
    return res.status(200).json(parsedQuery);
  } catch (error) {
    console.error('Error in /parse endpoint:', error);
    return res.status(500).json({
      error: 'Parser failed',
      details: error.message,
    });
  }
});

// --- SPRINT C ROUTE (Main Endpoint) ---
router.post('/match', async (req, res) => {
  const { text, history } = req.body; //  'history' is for later

  if (!text) {
    return res.status(400).json({ error: 'Missing "text" field in body' });
  }

  try {
    // Step 1: Parse the user's query (from Sprint B)
    const parsedQuery = await parseQuery(text);

    console.log('--- Parsed Query ---');
    console.log(parsedQuery);
    console.log('----------------------');

    // Step 2: Run the agent to orchestrate tools
    // We pass both the raw text (for context) and the parsed query (for tools)
    console.log('--- Calling runAgent ---');
    const agentResponse = await runAgent(text, parsedQuery, history || []);

    console.log('--- Agent Response Received ---');
    console.log('Response type:', typeof agentResponse);
    console.log('Response value:', agentResponse);
    console.log('Response length:', agentResponse?.length);
    console.log('----------------------');

    // Step 3: Return the agent's final, user-facing response
    return res.status(200).json({
      response: agentResponse, // This is the natural language response
      parsedQuery: parsedQuery, // We can return this for debugging on the frontend
    });

  } catch (error) {
    console.error('Error in /match endpoint:', error);
    console.error('Error stack:', error.stack);
    // LangChain errors can be complex, stringify them
    return res.status(500).json({
      error: 'Agent orchestration failed',
      details: error.message,
    });
  }
});

export { router };