/**
 * Global state management using Zustand
 */

import { create } from 'zustand';
import type { ChatMessage, PriceData, RandomNumberRequest } from '../types';

interface AppState {
  // Wallet connection
  isWalletConnected: boolean;
  walletAddress: string | null;
  setWalletConnected: (connected: boolean, address: string | null) => void;

  // Chat state
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // API Keys
  deepseekApiKey: string;
  setDeepseekApiKey: (key: string) => void;

  // Price feed state
  selectedPriceFeed: string;
  setSelectedPriceFeed: (feedId: string) => void;
  currentPrice: PriceData | null;
  setCurrentPrice: (price: PriceData | null) => void;
  priceHistory: Array<{ timestamp: number; price: number }>;
  addPriceToHistory: (timestamp: number, price: number) => void;

  // Entropy state
  randomNumberRequest: RandomNumberRequest | null;
  setRandomNumberRequest: (request: RandomNumberRequest | null) => void;
  generatedRandomNumber: string | null;
  setGeneratedRandomNumber: (number: string | null) => void;

  // Loading states
  isLoadingChat: boolean;
  setIsLoadingChat: (loading: boolean) => void;
  isUpdatingPrice: boolean;
  setIsUpdatingPrice: (loading: boolean) => void;
  isRequestingRandom: boolean;
  setIsRequestingRandom: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Wallet
  isWalletConnected: false,
  walletAddress: null,
  setWalletConnected: (connected, address) =>
    set({ isWalletConnected: connected, walletAddress: address }),

  // Chat
  chatMessages: [],
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  clearChat: () => set({ chatMessages: [] }),

  // API Keys
  deepseekApiKey: '',
  setDeepseekApiKey: (key) => set({ deepseekApiKey: key }),

  // Price feeds
  selectedPriceFeed: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD default
  setSelectedPriceFeed: (feedId) => set({ selectedPriceFeed: feedId }),
  currentPrice: null,
  setCurrentPrice: (price) => set({ currentPrice: price }),
  priceHistory: [],
  addPriceToHistory: (timestamp, price) =>
    set((state) => ({
      priceHistory: [...state.priceHistory.slice(-19), { timestamp, price }],
    })),

  // Entropy
  randomNumberRequest: null,
  setRandomNumberRequest: (request) => set({ randomNumberRequest: request }),
  generatedRandomNumber: null,
  setGeneratedRandomNumber: (number) => set({ generatedRandomNumber: number }),

  // Loading states
  isLoadingChat: false,
  setIsLoadingChat: (loading) => set({ isLoadingChat: loading }),
  isUpdatingPrice: false,
  setIsUpdatingPrice: (loading) => set({ isUpdatingPrice: loading }),
  isRequestingRandom: false,
  setIsRequestingRandom: (loading) => set({ isRequestingRandom: loading }),
}));
