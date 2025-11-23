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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b-4 border-purple-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Network className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  PythAI Trading 🎀
                </h1>
                <p className="text-xs text-purple-600 font-medium">
                  ✨ Powered by Pyth Network • Price Feeds + Entropy
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-2xl border-2 border-purple-300 hover:bg-purple-50 hover:scale-105 transition-transform"
            >
              <Settings className="w-5 h-5 text-purple-600" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50 border-b-4 border-yellow-300">
          <div className="container mx-auto px-6 py-6">
            <Card className="border-4 border-purple-200 rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-600 flex items-center gap-2">
                  ⚙️ Settings
                </CardTitle>
                <CardDescription className="text-purple-500">
                  Configure your API keys for enhanced functionality ✨
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-bold mb-2 block text-purple-700">
                    🔑 DeepSeek API Key (Optional)
                  </label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="rounded-2xl border-2 border-purple-300 focus:border-purple-500"
                  />
                  <p className="text-xs text-purple-600 mt-2">
                    Get your API key from <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">DeepSeek Platform</a> 🚀
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveSettings} className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg">
                    💾 Save Settings
                  </Button>
                  <Button variant="outline" onClick={() => setShowSettings(false)} className="rounded-2xl border-2 border-purple-300 hover:bg-purple-50">
                    ❌ Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Chatbot */}
          <div className="transform hover:scale-[1.02] transition-transform">
            <Chatbot />
          </div>

          {/* Right Column - Dashboard */}
          <div className="transform hover:scale-[1.02] transition-transform">
            <Dashboard />
          </div>
        </div>

        {/* Info Section - Bento Grid Style */}
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Card className="border-4 border-pink-200 rounded-3xl shadow-lg bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-pink-700 font-black">🎯 Hackathon Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-pink-600 font-medium">
                This application demonstrates both Pyth Price Feeds (Pull Oracle) and Pyth Entropy, 
                making it eligible for multiple prize categories ✨
              </p>
            </CardContent>
          </Card>

          <Card className="border-4 border-purple-200 rounded-3xl shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-purple-700 font-black">⛓️ Pull Oracle Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-600 font-medium">
                Complete implementation of Fetch → Update → Consume workflow as required by 
                the hackathon qualification criteria 🚀
              </p>
            </CardContent>
          </Card>

          <Card className="border-4 border-blue-200 rounded-3xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-blue-700 font-black">🤖 AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-600 font-medium">
                Chat with an AI expert trained on Pyth Network to discover innovative use cases 
                and get technical guidance 💡
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center pb-8">
          <div className="inline-block bg-white/80 backdrop-blur-sm border-4 border-purple-200 rounded-3xl px-8 py-4 shadow-lg">
            <p className="text-sm text-purple-700 font-bold">
              Built with 💖 for Pyth Network Hackathon • 
              <a href="https://pyth.network" target="_blank" rel="noopener noreferrer" className="underline ml-1 hover:text-pink-500 transition-colors">
                pyth.network ✨
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
