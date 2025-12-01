import { parseQuery } from './parser.js';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
    try {
        const inputs = [
            // "I need a ride from my location to college after dinner",
            // "Go to the airport tomorrow at 5pm",
            // "Take me to 123 Main St now",
            "college to city a 5pm"
        ];

        for (const input of inputs) {
            console.log(`\nTesting with input: "${input}"`);
            try {
                const result = await parseQuery(input);
                console.log("Result:", JSON.stringify(result, null, 2));
                import('fs').then(fs => fs.writeFileSync('result.json', JSON.stringify(result, null, 2)));
            } catch (err) {
                console.error("Failed to parse:", err);
            }
        }
    } catch (error) {
        console.error("Global error:", error);
    }
}

test();
