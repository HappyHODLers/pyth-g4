/**
 * Main App Component
 * PythAI Trading Agent & Dashboard
 */

import React, { useState } from 'react';
import { Settings, Network } from 'lucide-react';
import { Chatbot } from './components/Chatbot';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { useAppStore } from './store/appStore';
import './index.css';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { deepseekApiKey, setDeepseekApiKey } = useAppStore();
  const [tempApiKey, setTempApiKey] = useState(deepseekApiKey);

  // Initialize API key on first load
  React.useEffect(() => {
    if (!deepseekApiKey) {
      setDeepseekApiKey('sk-f984577379764c759173c5762d9c25ec');
    }
  }, []);

  const handleSaveSettings = () => {
    setDeepseekApiKey(tempApiKey);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  PythAI Trading Agent
                </h1>
                <p className="text-xs text-muted-foreground">
                  Powered by Pyth Network • Price Feeds + Entropy
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b bg-yellow-50 dark:bg-yellow-900/20">
          <div className="container mx-auto px-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure your API keys for enhanced functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    DeepSeek API Key (Optional)
                  </label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your API key from <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="underline">DeepSeek Platform</a>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveSettings}>Save Settings</Button>
                  <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Chatbot */}
          <div>
            <Chatbot />
          </div>

          {/* Right Column - Dashboard */}
          <div>
            <Dashboard />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎯 Hackathon Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This application demonstrates both Pyth Price Feeds (Pull Oracle) and Pyth Entropy, 
                making it eligible for multiple prize categories.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⛓️ Pull Oracle Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete implementation of Fetch → Update → Consume workflow as required by 
                the hackathon qualification criteria.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🤖 AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Chat with an AI expert trained on Pyth Network to discover innovative use cases 
                and get technical guidance.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground pb-8">
          <p>
            Built with ❤️ for Pyth Network Hackathon • 
            <a href="https://pyth.network" target="_blank" rel="noopener noreferrer" className="underline ml-1">
              pyth.network
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
