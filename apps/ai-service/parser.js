// parser.js
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// --- 1. Define Output Schema ---
const querySchema = z.object({
  origin: z.string().describe('Starting location, e.g., "Hostel Gate, Ranpur"'),
  originLat: z.number().nullable().describe('Latitude of origin'),
  originLng: z.number().nullable().describe('Longitude of origin'),
  destination: z.string().describe('Ending location, e.g., "City Mall, Ranpur"'),
  destLat: z.number().nullable().describe('Latitude of destination'),
  destLng: z.number().nullable().describe('Longitude of destination'),
  earliestDepartureISO: z
    .string()
    .nullable()
    .describe('Earliest departure time in ISO 8601 format'),
  latestDepartureISO: z
    .string()
    .nullable()
    .describe('Latest departure time in ISO 8601 format'),
  maxCost: z.number().nullable().describe('Maximum cost the user is willing to pay'),
  radiusKm: z.number().default(3).describe('Search radius in KM'),
});

// --- 2. Initialize Parser Chain ---
let parserChain;

function getParserChain() {
  if (parserChain) return parserChain;

  const llm = new ChatOpenAI({
    modelName: 'gpt-4o', // Updated to gpt-4o for better compatibility
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const structuredLlm = llm.withStructuredOutput(querySchema, { strict: false });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a strict JSON-output parser for a ride-sharing app.

CRITICAL RULES FOR ORIGIN:
- If the user says "my location", "here", "current location", or similar → use "user current location"
- If the user ONLY mentions a destination (e.g., "Go to the airport", "Take me to the mall") → use "user current location" as origin
- If the user explicitly mentions both locations (e.g., "from A to B") → use those exact locations
- If the user mentions "from X" → use X as origin and ask for destination

Parse explicit times like "2 AM", "14:30", "tomorrow at 5pm" into ISO 8601 format with a ±15 min window for both earliest and latest.
Today's date is {date} (assume local timezone UTC+5:30).

Examples:
Input: "I need a ride from my location to college after dinner"
Output: {{ "origin": "user current location", "destination": "college", "earliestDepartureISO": "2025-11-27T19:45:00", "latestDepartureISO": "2025-11-27T20:15:00" }}

Input: "Go to the airport tomorrow at 5pm"
Output: {{ "origin": "user current location", "destination": "the airport", "earliestDepartureISO": "2025-11-28T16:45:00", "latestDepartureISO": "2025-11-28T17:15:00" }}

Input: "From college to the mall at 3pm"
Output: {{ "origin": "college", "destination": "the mall", "earliestDepartureISO": "2025-11-27T14:45:00", "latestDepartureISO": "2025-11-27T15:15:00" }}
`,
    ],
    ['human', '{input}'],
  ]);

  parserChain = prompt.pipe(structuredLlm);

  return parserChain;
}

// --- 3. Export parseQuery ---
export async function parseQuery(text) {
  const chain = getParserChain();
  console.log(`[DEBUG] Invoking chain with input: "${text}"`);

  const date = new Date().toISOString().split('T')[0];
  const response = await chain.invoke({
    input: text,
    date: date
  });

  console.log('[DEBUG] Raw Response:', JSON.stringify(response, null, 2));

  return response;
}
