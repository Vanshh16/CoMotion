// const fewShotExamples = [
//   {
//     user: 'I need a ride from Hostel Gate to City Mall around 8pm tonight under 100 rupees',
//     json: {
//       origin: "Hostel Gate",
//       destination: "City Mall",
//       earliestDepartureISO: null,
//       latestDepartureISO: null,
//       maxCost: 100,
//       radiusKm: 3
//     }
//   },
//   {
//     user: 'From college to railway station tomorrow at 7:30 AM, budget 80',
//     json: {
//       origin: "College",
//       destination: "Railway Station",
//       earliestDepartureISO: null,
//       latestDepartureISO: null,
//       maxCost: 80,
//       radiusKm: 3
//     }
//   }
// ];

// // Build the prompt template with few-shot examples + instruction
// const buildPrompt = (userText) => {
//   const examplesText = fewShotExamples.map((ex, i) => {
//     return `Example ${i + 1} user: ${ex.user}\nOutput JSON:\n${JSON.stringify(ex.json, null, 2)}\n`;
//   }).join("\n");

//   const template = `
// You are a strict JSON parser. Given a user's free-text ride request, output ONLY a single valid JSON object (no surrounding text) with the following fields (use null when unknown):
// - origin (string)
// - destination (string)
// - earliestDepartureISO (string or null)  // ISO8601 datetime
// - latestDepartureISO (string or null)    // ISO8601 datetime
// - originLat (number) and originLng (number) if coordinates are given (otherwise omit)
// - maxCost (number or null)
// - radiusKm (number or null)

// Use these examples to guide formatting:

// ${examplesText}

// Now parse this request and output only JSON:

// User: {user_text}
// `;

//   return template.replace("{user_text}", userText);
// };

// export async function parseFreeTextToQuery(userText, opts = {}) {
//   // opts can include model, temperature overrides
//   const modelName = opts.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
//   const temperature = typeof opts.temperature === "number" ? opts.temperature : 0.0;

//   // init the LLM via LangChain OpenAI wrapper
//   const llm = new OpenAI({
//     modelName,
//     temperature,
//     openAIApiKey: process.env.OPENAI_API_KEY
//   });

//   const prompt = buildPrompt(userText);
//   const promptTemplate = new PromptTemplate({
//     template: prompt,
//     inputVariables: []
//   });

//   const chain = new LLMChain({ llm, prompt: promptTemplate });

//   // run chain
//   const resp = await chain.run();
//   // chain.run returns string from model; try to parse it as JSON
//   let parsed;
//   try {
//     parsed = JSON.parse(resp);
//   } catch (err) {
//     // try to extract JSON substring
//     const start = resp.indexOf("{");
//     const end = resp.lastIndexOf("}");
//     if (start >= 0 && end >= 0) {
//       const candidate = resp.slice(start, end + 1);
//       parsed = JSON.parse(candidate);
//     } else {
//       throw new Error(`Parser chain returned non-JSON output: ${resp}`);
//     }
//   }

//   return parsed;
// }





// apps/ai-service/parserChain.js

// Updated imports from modern, modular LangChain packages
import { ChatOpenAI } from "@langchain/openai";
import {
  PromptTemplate,
  FewShotPromptTemplate,
} from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

// The examples remain the same.
const fewShotExamples = [
  {
    user: 'I need a ride from Hostel Gate to City Mall around 8pm tonight under 100 rupees',
    // The JSON output in examples should be a string, as that's what the template expects.
    json: JSON.stringify({
      origin: "Hostel Gate",
      destination: "City Mall",
      earliestDepartureISO: null,
      latestDepartureISO: null,
      maxCost: 100,
      radiusKm: 3
    }, null, 2)
  },
  {
    user: 'From college to railway station tomorrow at 7:30 AM, budget 80',
    json: JSON.stringify({
      origin: "College",
      destination: "Railway Station",
      earliestDepartureISO: null, // Note: A more advanced version could calculate this date
      latestDepartureISO: null,
      maxCost: 80,
      radiusKm: 3
    }, null, 2)
  }
];

// This is the core refactored function using modern LangChain
export async function parseFreeTextToQuery(userText, opts = {}) {
  // 1. Define model with options from environment or function call
  const modelName = opts.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const temperature = typeof opts.temperature === "number" ? opts.temperature : 0.0;

  const model = new ChatOpenAI({
    modelName,
    temperature,
    // The API key is automatically read from the OPENAI_API_KEY environment variable
  });

  // 2. Create a prompt template for how to format a SINGLE few-shot example
  const examplePrompt = PromptTemplate.fromTemplate(
    "User: {user}\nOutput JSON:\n```json\n{json}\n```"
  );

  // 3. Create the main FewShotPromptTemplate.
  // This class correctly assembles the instructions (prefix), the formatted examples,
  // and the final user input (suffix) into a complete prompt.
  const fewShotPrompt = new FewShotPromptTemplate({
    examples: fewShotExamples,
    examplePrompt,
    prefix: `You are a strict JSON parser. Given a user's free-text ride request, output ONLY a single valid JSON object with the following fields (use null when unknown):
- origin (string)
- destination (string)
- earliestDepartureISO (string or null)  // ISO8601 datetime
- latestDepartureISO (string or null)    // ISO8601 datetime
- originLat (number) and originLng (number) if coordinates are given (otherwise omit)
- maxCost (number or null)
- radiusKm (number or null)

Use these examples to guide formatting:`,
    suffix: "Now parse this request and output only a valid JSON object:\n\nUser: {user_text}",
    inputVariables: ["user_text"],
  });

  // 4. Instantiate the JSON output parser.
  // This will automatically parse the model's string output into a JSON object.
  // It also handles retries and formatting instructions automatically.
  const parser = new JsonOutputParser();

  // 5. Create the chain by "piping" components together using LCEL.
  // This is the modern replacement for the old `LLMChain`.
  const chain = fewShotPrompt.pipe(model).pipe(parser);

  // 6. Invoke the chain. The result is already a clean, parsed JSON object.
  const parsedJson = await chain.invoke({
    user_text: userText,
  });

  return parsedJson;
}