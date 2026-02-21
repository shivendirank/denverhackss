import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, agentContext } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    // If no API key, return agent-specific fallback
    if (!apiKey) {
      const fallbackResponse = getFallbackResponse(message, agentContext);
      return NextResponse.json({ response: fallbackResponse });
    }

    // Build system prompt with agent context
    const systemPrompt = agentContext
      ? `You are ${agentContext.name}, a ${agentContext.role}. 

Description: ${agentContext.description}

Your capabilities include:
${agentContext.capabilities?.map((c: string) => `- ${c}`).join('\n') || '- General AI assistance'}

Respond naturally and concisely (2-3 sentences max). Stay in character and reference your specific capabilities when relevant. Be helpful, engaging, and professional.`
      : 'You are a helpful AI assistant. Respond naturally and concisely (2-3 sentences max). Be engaging and professional.';

    // Make request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.8,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      const fallbackResponse = getFallbackResponse(message, agentContext);
      return NextResponse.json({ response: fallbackResponse });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || getFallbackResponse(message, agentContext);

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error('Chat error:', error);
    const fallbackResponse = getFallbackResponse('', null);
    return NextResponse.json({ response: fallbackResponse });
  }
}

function getFallbackResponse(message: string, agentContext?: any): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return agentContext 
      ? `Hello! I'm ${agentContext.name}, your ${agentContext.role}. How can I assist you today?`
      : "Hello! I'm your AI assistant. How can I help you today?";
  }
  
  if (lowerMessage.includes('what') && lowerMessage.includes('do')) {
    return agentContext
      ? `As ${agentContext.name}, I specialize in ${agentContext.capabilities?.[0] || 'AI assistance'}. I'm here to help with ${agentContext.role.toLowerCase()} tasks.`
      : "I'm an AI agent designed to help with various tasks. I can answer questions, provide information, and assist with problem-solving.";
  }
  
  if (lowerMessage.includes('help')) {
    return agentContext
      ? `I'm ${agentContext.name}, and I can help you with: ${agentContext.capabilities?.slice(0, 2).join(', ') || 'various tasks'}. What would you like to know?`
      : "I'm here to help! I can answer questions, provide guidance, and assist with various tasks. What would you like to know?";
  }
  
  if (lowerMessage.includes('capabilities') || lowerMessage.includes('skills')) {
    return agentContext
      ? `My capabilities include: ${agentContext.capabilities?.slice(0, 3).join(', ') || 'general AI assistance'}. Feel free to ask me about any of these!`
      : "I have a wide range of capabilities including natural language processing, data analysis, and problem-solving. Feel free to ask me anything!";
  }
  
  return agentContext
    ? `That's an interesting question! As ${agentContext.name}, I'm focused on ${agentContext.role.toLowerCase()} work. Could you tell me more about what you need help with?`
    : "That's an interesting question! I'm focused on helping you with various tasks. Could you tell me more about what you need assistance with?";
}
