import { parseQuery } from './parser.js';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
    const testCases = [
        "Go to the airport tomorrow at 5pm",
        "Take me to 123 Main St now",
        "I need a ride to college",
        "From my location to the mall at 3pm",
        "From college to the airport tomorrow",
    ];

    for (const input of testCases) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`Input: "${input}"`);
        console.log('='.repeat(70));
        try {
            const result = await parseQuery(input);
            console.log("✅ Result:", JSON.stringify(result, null, 2));
        } catch (err) {
            console.error("❌ Failed to parse:", err.message);
        }
    }
}

test();
