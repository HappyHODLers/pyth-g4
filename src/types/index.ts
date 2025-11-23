// Type definitions for the application

export interface PriceFeed {
  id: string;
  symbol: string;
  name: string;
}

export interface PriceData {
  price: string;
  expo: number;
  conf: string;
  publishTime: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RandomNumberRequest {
  requestId: string;
  userRandomNumber: string;
  blockNumber: number;
  status: 'pending' | 'fulfilled';
}

export interface RandomNumberResult {
  randomNumber: string;
  requestId: string;
}

export interface PriceChartData {
  timestamp: number;
  price: number;
}
