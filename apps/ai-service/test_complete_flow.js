import axios from 'axios';

async function testCompleteFlow() {
    try {
        console.log('🧪 Testing Complete AI Service Flow\n');
        console.log('='.repeat(70));

        const testQuery = 'Go to the airport tomorrow at 5pm';
        console.log(`\nQuery: "${testQuery}"\n`);

        const response = await axios.post('http://localhost:3002/api/ai/match', {
            text: testQuery
        });

        console.log('📊 PARSED QUERY:');
        console.log('='.repeat(70));
        console.log(JSON.stringify(response.data.parsedQuery, null, 2));

        console.log('\n🤖 AGENT RESPONSE:');
        console.log('='.repeat(70));
        console.log(response.data.response);
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testCompleteFlow();
