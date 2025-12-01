import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        console.log("Testing gpt-4o connection...");
        const llm = new ChatOpenAI({
            modelName: 'gpt-4o',
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        const res = await llm.invoke("Hello");
        console.log("Response:", res.content);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
