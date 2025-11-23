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
    <Card className="flex flex-col h-[700px]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          PythAI Trading Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
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
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoadingChat && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about Pyth Network..."
              disabled={isLoadingChat}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoadingChat}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {!deepseekApiKey && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 Running in demo mode. Add your DeepSeek API key for full AI capabilities.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
