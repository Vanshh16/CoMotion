import { NextResponse } from 'next/server';

// This is the URL of your *other* service
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002';

/**
 * Forwards a request from the Next.js frontend to the ai-service.
 */
export async function POST(request) {
  try {
    // 1. Get the body from the client (e.g., { text, history })
    const body = await request.json();

    // 2. Forward it to the AI service
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 3. Handle errors from the AI service itself
    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error('AI service error:', errorData);
      return NextResponse.json(
        { error: 'AI service failed', details: errorData },
        { status: aiResponse.status }
      );
    }

    // 4. Stream the response back to the client
    const data = await aiResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in AI proxy route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}