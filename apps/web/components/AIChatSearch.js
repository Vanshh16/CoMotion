'use client';

import { useState } from 'react';
import RideCard from './RideCard'; // Assuming this is your existing component

// A simple loading spinner component
function Spinner() {
  return (
    <div
      style={{
        border: '4px solid rgba(0, 0, 0, 0.1)',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        borderLeftColor: '#000',
        animation: 'spin 1s ease infinite',
      }}
    />
  );
}

export default function AIChatSearch() {
  // State for the chat messages
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! How can I help you find a ride today?' },
  ]);
  
  // State for the current text input
  const [input, setInput] = useState('');
  
  // State for the final ride results
  const [rideResults, setRideResults] = useState([]);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'human', content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setRideResults([]); // Clear old results

    try {
      // 1. Call our *own* Next.js API route
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input,
          history: messages, // Send the history *before* this new message
        }),
      });

      const data = await res.json();

      let aiMessage = { role: 'ai', content: 'Sorry, something went wrong.' };

      // 2. Process the structured response from the AI
      if (res.ok) {
        if (data.type === 'results') {
          aiMessage.content = data.explanation;
          setRideResults(data.results); // Set the ride results to display
        } else if (data.type === 'clarification') {
          aiMessage.content = data.question;
        } else if (data.type === 'message') {
          aiMessage.content = data.response;
        }
      } else {
        aiMessage.content = data.error || aiMessage.content;
      }

      // 3. Add the AI's response to the chat
      setMessages([...newMessages, aiMessage]);

    } catch (error) {
      console.error('Failed to fetch from AI proxy:', error);
      setMessages([
        ...newMessages,
        { role: 'ai', content: 'I am having trouble connecting... Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto' }}>
      
      {/* 1. RIDE RESULTS SECTION */}
      {rideResults.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Here's what I found:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* You can modify your RideCard to also accept and display 
              result.score and result.explanation for a richer UI! 
            */}
            {rideResults.map((result) => (
              <RideCard key={result.ride.id} ride={result.ride} />
            ))}
          </div>
        </div>
      )}

      {/* 2. CHAT INTERFACE SECTION */}
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
        <div 
          style={{ 
            height: '300px', 
            overflowY: 'auto', 
            marginBottom: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                alignSelf: msg.role === 'human' ? 'flex-end' : 'flex-start',
                background: msg.role === 'human' ? '#007bff' : '#eee',
                color: msg.role === 'human' ? 'white' : 'black',
                padding: '8px 12px',
                borderRadius: '15px',
                maxWidth: '80%',
              }}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start' }}>
              <Spinner />
            </div>
          )}
        </div>

        {/* 3. INPUT FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., Ride from hostel to mall at 8pm"
            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button 
            type="submit" 
            disabled={isLoading} 
            style={{ padding: '10px 15px', marginLeft: '5px', borderRadius: '5px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer' }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}