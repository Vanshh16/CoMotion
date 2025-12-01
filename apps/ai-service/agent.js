import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { dbSearchTool, scoreAndRankTool } from './tools.js';

// Cache the LLM
let llm;

function getLLM() {
  if (llm) return llm;

  llm = new ChatOpenAI({
    modelName: 'gpt-4o',
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  return llm;
}

/**
 * Simplified agent that manually orchestrates tool calls
 */
export async function runAgent(text, parsedQuery, chatHistory = []) {
  console.log('[Agent] Starting orchestration...');
  console.log('[Agent] Query:', text);
  console.log('[Agent] Parsed:', JSON.stringify(parsedQuery, null, 2));

  try {
    // Step 1: Search for rides using database_search tool
    console.log('[Agent] Step 1: Searching database...');

    // Clean up destination text (remove articles for better matching)
    let destText = parsedQuery.destination || '';
    destText = destText.replace(/^(the|a|an)\s+/i, '').trim();
    console.log(`[Agent] Cleaned destination: "${parsedQuery.destination}" → "${destText}"`);

    const searchResult = await dbSearchTool.func({
      destText: destText,
      earliestDepartureISO: parsedQuery.earliestDepartureISO,
      latestDepartureISO: parsedQuery.latestDepartureISO,
      maxCost: parsedQuery.maxCost,
    });

    const candidates = JSON.parse(searchResult);
    console.log(`[Agent] Found ${candidates.length} candidates`);

    if (candidates.length === 0) {
      return "I'm sorry, I couldn't find any rides matching your criteria. Please try adjusting your search parameters or try again later.";
    }

    // Step 2: Score and rank the candidates
    console.log('[Agent] Step 2: Scoring and ranking...');

    const rankResult = await scoreAndRankTool.func({
      candidates: candidates,
      parsedQuery: parsedQuery,
    });

    const rankedResults = JSON.parse(rankResult);
    console.log(`[Agent] Ranked ${rankedResults.length} results`);

    // Step 3: Generate natural language response using LLM
    console.log('[Agent] Step 3: Generating response...');

    const topRides = rankedResults.slice(0, 3);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are CoMotion, a helpful ride-matching assistant. 
Present the following ride options to the user in a friendly, conversational way.
Include key details like origin, destination, departure time, cost, and available seats.
Mention why each ride is a good match based on the user's request.`,
      ],
      [
        'human',
        `User requested: {userQuery}

I found these rides for you:

{rideDetails}

Please present these options in a friendly way.`,
      ],
    ]);

    const chain = prompt.pipe(getLLM());

    const rideDetails = topRides
      .map((item, idx) => {
        const ride = item.ride;
        return `${idx + 1}. ${item.explanation}
   Driver: ${ride.driver.name}
   Status: ${ride.status}`;
      })
      .join('\n\n');

    const result = await chain.invoke({
      userQuery: text,
      rideDetails: rideDetails,
    });

    console.log('[Agent] Response generated successfully');
    return result.content;

  } catch (error) {
    console.error('[Agent] Error:', error);
    console.error('[Agent] Stack:', error.stack);
    return `I encountered an error while searching for rides: ${error.message}. Please try again.`;
  }
}