/**
 * DeepSeek AI Chat Service
 * Handles communication with the DeepSeek API for the AI chatbot
 */

import type { ChatMessage } from '../types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a Pyth Network expert and DeFi trading assistant. Your role is to:

1. Explain the functionality of Pyth Price Feeds and Pyth Entropy in clear, accessible terms.
2. Provide tips and strategies for hackers to build innovative dApps using Pyth data for the hackathon.
3. Analyze trading strategies and explain how real-time, high-fidelity data from Pyth can be used for DeFi protocols, on-chain games, and prediction markets.
4. Suggest ways to combine Price Feeds and Entropy for novel applications (e.g., randomized NFT traits based on market conditions, fair lottery systems tied to asset volatility, dynamic game mechanics that respond to real-world market data).
5. Be enthusiastic and encouraging to builders, offering specific technical guidance when appropriate.

Keep your responses concise, practical, and focused on actionable insights for developers.`;

export interface DeepSeekResponse {
  id: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a message to the DeepSeek API and get a response
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  apiKey: string
): Promise<string> {
  try {
    // Prepare the messages array with the system prompt
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: DeepSeekResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw new Error(`Failed to get AI response: ${error}`);
  }
}

/**
 * Get a demo response when API key is not available
 * This allows the app to function in demo mode
 */
export function getDemoResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('price feed') || lowerMessage.includes('oracle')) {
    return `Pyth Price Feeds are pull-based oracles that provide high-fidelity, real-time financial market data. Unlike traditional push oracles, Pyth uses a "pull" model where:

1. **Fetch**: You retrieve price update data from Hermes (Pyth's data service)
2. **Update**: You submit this data to the on-chain Pyth contract
3. **Consume**: Your smart contract reads the fresh price data

This design gives you maximum control over data freshness and helps minimize gas costs. Popular use cases include:
- Decentralized perpetual futures
- Lending protocols with accurate collateral pricing  
- Options and derivatives platforms
- Dynamic NFT pricing based on real-world assets

What specific use case are you building?`;
  }
  
  if (lowerMessage.includes('entropy') || lowerMessage.includes('random')) {
    return `Pyth Entropy enables you to generate verifiable random numbers on-chain with cryptographic security. Here's how it works:

1. **Request**: Your contract requests a random number with a user commitment
2. **Generate**: Pyth's provider combines your commitment with their secret
3. **Reveal**: The final random number is computed and can be verified

Amazing applications for Entropy:
- **Fair Lotteries**: Provably random winner selection
- **Gaming**: Unpredictable loot drops, enemy spawns, or map generation
- **NFTs**: Randomized traits at mint time
- **Prediction Markets**: Random sampling for oracle resolution

Pro tip: Combine Price Feeds + Entropy for innovative mechanics like "higher volatility = higher rarity drops" in games!`;
  }
  
  if (lowerMessage.includes('combine') || lowerMessage.includes('innovative')) {
    return `Here are some innovative ways to combine Pyth Price Feeds and Entropy:

🎮 **Volatility-Based Game Mechanics**
- Use price volatility to adjust loot drop rates
- Higher market volatility = better rewards in your game

🎨 **Dynamic NFT Collections**
- Generate NFT traits based on BTC/ETH price at mint time
- Randomize trait rarity using Entropy, weighted by market conditions

🎲 **Fair Prediction Markets**
- Use Entropy for random sampling of data points
- Price Feeds provide the actual market data for settlements

💰 **DeFi Innovations**
- Random yield boosts tied to market performance
- Lottery-style savings accounts with odds based on TVL

The key is using real-world data (Price Feeds) to influence on-chain randomness (Entropy) in meaningful ways!`;
  }
  
  return `Great question! Pyth Network offers two powerful primitives for your dApp:

**Pyth Price Feeds** provide real-time financial data for 400+ assets across crypto, equities, FX, and commodities. Perfect for DeFi protocols, trading platforms, and any app needing accurate price information.

**Pyth Entropy** generates cryptographically secure random numbers on-chain. Ideal for gaming, NFTs, lotteries, and any application requiring verifiable randomness.

For the hackathon, try combining both! Ask me about:
- How to implement the pull oracle workflow
- Creative use cases for Entropy
- Ways to combine Price Feeds and randomness
- Best practices for your specific application

What are you building?`;
}
