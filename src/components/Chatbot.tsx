/**
 * AI Chatbot Component
 * Interactive chat interface with DeepSeek AI for Pyth Network guidance
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAppStore } from '../store/appStore';
import { sendChatMessage, getDemoResponse } from '../services/aiChat';

export function Chatbot() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    chatMessages,
    addChatMessage,
    isLoadingChat,
    setIsLoadingChat,
    deepseekApiKey,
  } = useAppStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Add welcome message on first load
  useEffect(() => {
    if (chatMessages.length === 0) {
      addChatMessage({
        role: 'assistant',
        content: `Welcome to PythAI Trading Agent! 👋

I'm your expert guide for building with Pyth Network. I can help you with:

🔮 **Pyth Price Feeds** - Real-time oracle data for 400+ assets
🎲 **Pyth Entropy** - Verifiable on-chain randomness
💡 **Hackathon Ideas** - Innovative use cases combining both
🛠️ **Technical Implementation** - Best practices and code guidance

What would you like to know about building with Pyth?`,
      });
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoadingChat) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    addChatMessage({ role: 'user', content: userMessage });
    setIsLoadingChat(true);

    try {
      let response: string;
      
      // Check if API key is available
      if (deepseekApiKey && deepseekApiKey.trim().length > 0) {
        // Use real DeepSeek API
        response = await sendChatMessage(chatMessages, deepseekApiKey);
      } else {
        // Use demo responses
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        response = getDemoResponse(userMessage);
      }

      // Add AI response to chat
      addChatMessage({ role: 'assistant', content: response });
    } catch (error) {
      console.error('Error getting AI response:', error);
      addChatMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check your API key configuration.',
      });
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[700px] border-4 border-purple-300 rounded-3xl shadow-xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <CardHeader className="border-b-4 border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-3xl">
        <CardTitle className="flex items-center gap-2 text-purple-700 font-black">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md border-2 border-purple-300">
            <Bot className="w-6 h-6 text-white" />
          </div>
          🤖 PythAI Trading Agent ✨
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-md border-2 border-purple-300">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-3xl p-4 shadow-md border-2 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-pink-400 to-purple-400 text-white border-pink-300 font-medium'
                    : 'bg-white/90 border-purple-200 text-purple-700'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-md border-2 border-pink-300">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoadingChat && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-md border-2 border-purple-300 animate-pulse">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/90 border-2 border-purple-200 rounded-3xl p-4 shadow-md">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t-4 border-purple-200 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-b-3xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="💬 Ask me anything about Pyth Network..."
              disabled={isLoadingChat}
              className="flex-1 rounded-2xl border-2 border-purple-300 font-medium shadow-sm bg-white/90"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoadingChat}
              size="icon"
              className="rounded-2xl border-2 border-pink-300 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-pink-400 to-purple-400"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {!deepseekApiKey && (
            <p className="text-xs text-purple-700 font-bold mt-2 bg-white/80 rounded-2xl px-3 py-2 border-2 border-purple-200">
              💡 Running in demo mode. Add your DeepSeek API key for full AI capabilities ✨
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
