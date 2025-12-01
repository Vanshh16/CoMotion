import axios from 'axios';

async function fullDemo() {
    console.log('\n🎯 COMPLETE END-TO-END AI SERVICE DEMONSTRATION\n');
    console.log('='.repeat(80));

    const queries = [
        'Go to the airport tomorrow at 5pm',
        'Find rides to the airport tomorrow',
        'I need to get to the airport'
    ];

    for (const query of queries) {
        try {
            console.log(`\n\n🔍 Query: "${query}"`);
            console.log('─'.repeat(80));

            const response = await axios.post('http://localhost:3002/api/ai/match', {
                text: query
            });

            console.log('\n📊 Parsed Query:');
            console.log(`   Origin: ${response.data.parsedQuery.origin}`);
            console.log(`   Destination: ${response.data.parsedQuery.destination}`);
            console.log(`   Time: ${response.data.parsedQuery.earliestDepartureISO || 'Not specified'}`);

            console.log('\n🤖 Agent Response:');
            console.log(`   ${response.data.response}`);

            console.log('\n' + '='.repeat(80));

        } catch (error) {
            console.error(`\n❌ Error for "${query}":`, error.message);
        }
    }
}

fullDemo();
