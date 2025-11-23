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
        <div className="bg-gradient-to-r from-[#DC9F69]/20 via-orange-50 to-cyan-50 border-b-4 border-[#7E533D]">
          <div className="container mx-auto px-6 py-6">
            <Card className="border-4 border-[#7E533D] rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#7E533D] flex items-center gap-2">
                  ⚙️ Settings
                </CardTitle>
                <CardDescription className="text-[#7E533D]">
                  Configure your API keys for enhanced functionality ✨
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-bold mb-2 block text-[#7E533D]">
                    🔑 DeepSeek API Key (Optional)
                  </label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="rounded-2xl border-2 border-[#7E533D] focus:border-[#00B5E6]"
                  />
                  <p className="text-xs text-[#7E533D] mt-2">
                    Get your API key from <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-[#D92B29]">DeepSeek Platform</a> 🚀
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveSettings} className="rounded-2xl bg-gradient-to-r from-[#3E9138] to-[#00B5E6] hover:from-[#3E9138]/80 hover:to-[#00B5E6]/80 shadow-lg">
                    💾 Save Settings
                  </Button>
                  <Button variant="outline" onClick={() => setShowSettings(false)} className="rounded-2xl border-2 border-[#D92B29] hover:bg-[#D92B29]/10">
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

        {/* Footer */}
        <footer className="mt-10 text-center pb-8">
          <div className="inline-block bg-white/80 backdrop-blur-sm border-4 border-[#7E533D] rounded-3xl px-8 py-4 shadow-lg">
            <p className="text-sm text-[#7E533D] font-bold">
              Built with 💖 for Pyth Network Hackathon • 
              <a href="https://pyth.network" target="_blank" rel="noopener noreferrer" className="underline ml-1 hover:text-[#D92B29] transition-colors">
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
