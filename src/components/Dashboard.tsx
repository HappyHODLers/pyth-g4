/**
 * Dashboard Component
 * Displays Pyth Price Feeds and Entropy integrations
 */

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/appStore';
import {
  PRICE_FEEDS,
  getPriceFromHermes,
  parsePrice,
  updatePriceOnChain,
  getOnChainPrice,
} from '../services/pythPriceFeeds';
import { formatPrice, formatTimestamp } from '../utils/helpers';

export function Dashboard() {
  const {
    selectedPriceFeed,
    setSelectedPriceFeed,
    currentPrice,
    setCurrentPrice,
    priceHistory,
    addPriceToHistory,
    isUpdatingPrice,
    setIsUpdatingPrice,
    isWalletConnected,
    walletAddress,
    setWalletConnected,
  } = useAppStore();

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [timeframe, setTimeframe] = useState<number>(60); // seconds
  const [isGettingRecommendation, setIsGettingRecommendation] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask or another Web3 wallet!');
        return;
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      const web3Signer = await web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setWalletConnected(true, accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  // Fetch price from Hermes (for display)
  const fetchPrice = async () => {
    try {
      const priceData = await getPriceFromHermes(selectedPriceFeed);
      const displayPrice = parsePrice(priceData.price, priceData.expo);
      
      setCurrentPrice(priceData);
      addPriceToHistory(priceData.publishTime, displayPrice);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  // Update price on-chain
  const handleUpdatePrice = async () => {
    if (!provider || !signer) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsUpdatingPrice(true);
    try {
      const txHash = await updatePriceOnChain(selectedPriceFeed, provider, signer);
      alert(`Price updated successfully! Transaction: ${txHash}`);
      
      // Fetch the updated on-chain price
      await handleGetOnChainPrice();
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price on-chain. See console for details.');
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Get on-chain price
  const handleGetOnChainPrice = async () => {
    if (!provider) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      const priceData = await getOnChainPrice(selectedPriceFeed, provider);
      const displayPrice = parsePrice(priceData.price, priceData.expo);
      
      setCurrentPrice(priceData);
      alert(`On-chain price: ${formatPrice(displayPrice, 2)}`);
    } catch (error) {
      console.error('Error reading on-chain price:', error);
      alert('Failed to read on-chain price. Make sure the price feed has been updated first.');
    }
  };

  // Get AI trading recommendation
  const getAIRecommendation = async () => {
    if (priceHistory.length < 5) {
      alert('Necesitas más datos históricos para una recomendación. Espera unos segundos.');
      return;
    }

    setIsGettingRecommendation(true);
    try {
      const selectedFeed = PRICE_FEEDS.find(f => f.id === selectedPriceFeed);
      const latestPrice = priceHistory[priceHistory.length - 1].price;
      const oldestPrice = priceHistory[0].price;
      const priceChange = ((latestPrice - oldestPrice) / oldestPrice) * 100;
      
      const prices = priceHistory.slice(-10).map(p => p.price);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const volatility = Math.sqrt(prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length);

      // Create prompt for AI
      const prompt = `Como experto analista financiero, analiza estos datos en tiempo real de ${selectedFeed?.symbol}:

Precio actual: $${formatPrice(latestPrice, 2)}
Cambio reciente: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%
Volatilidad: ${volatility.toFixed(2)}
Precios últimos 10 puntos: ${prices.map(p => '$' + formatPrice(p, 2)).join(', ')}

Proporciona:
1. Recomendación: COMPRAR, VENDER o MANTENER
2. Probabilidad de subida en las próximas horas (%)
3. Probabilidad de bajada en las próximas horas (%)
4. Razón breve (máximo 2 líneas)
5. Nivel de riesgo: BAJO, MEDIO o ALTO

Formato de respuesta:
RECOMENDACIÓN: [tu recomendación]
📈 Probabilidad de subida: [X]%
📉 Probabilidad de bajada: [Y]%
💡 Razón: [tu análisis breve]
⚠️ Riesgo: [nivel]`;

      // Call AI service
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAppStore.getState().deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'Eres un experto analista financiero que proporciona recomendaciones basadas en datos en tiempo real.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener recomendación de IA');
      }

      const data = await response.json();
      const recommendation = data.choices[0].message.content;
      setAiRecommendation(recommendation);
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      alert('Error al obtener recomendación. Verifica tu API key de DeepSeek.');
    } finally {
      setIsGettingRecommendation(false);
    }
  };

  // Auto-fetch price on mount and when feed or timeframe changes
  useEffect(() => {
    fetchPrice();
    
    // Start polling for price updates based on selected timeframe
    const interval = setInterval(() => {
      if (!isPolling) {
        setIsPolling(true);
        fetchPrice().finally(() => setIsPolling(false));
      }
    }, timeframe * 1000);

    return () => clearInterval(interval);
  }, [selectedPriceFeed, timeframe]);

  const selectedFeed = PRICE_FEEDS.find(f => f.id === selectedPriceFeed);
  const displayPrice = currentPrice ? parsePrice(currentPrice.price, currentPrice.expo) : 0;

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      {!isWalletConnected ? (
        <Card className="border-4 border-[#7E533D] rounded-3xl shadow-lg bg-gradient-to-br from-[#DC9F69]/20 to-orange-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-[#7E533D] font-medium mb-4">
                💼 Connect your wallet to interact with Pyth contracts on-chain ✨
              </p>
              <Button onClick={connectWallet} className="rounded-2xl border-2 border-[#7E533D] shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-[#DC9F69] to-[#00B5E6] text-white font-bold">
                🔗 Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-4 border-[#3E9138] rounded-3xl shadow-lg bg-gradient-to-br from-[#3E9138]/20 to-[#00B5E6]/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-[#3E9138] font-bold">
                ✅ Connected: <span className="font-mono bg-white/80 px-3 py-1 rounded-2xl border-2 border-[#3E9138]">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
          {/* Price Feed Selector */}
          <Card className="border-4 border-[#00B5E6] rounded-3xl shadow-lg bg-gradient-to-br from-[#00B5E6]/20 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-[#7E533D] font-black">🔍 Select Price Feed</CardTitle>
              <CardDescription className="text-[#7E533D] font-medium">
                Choose from 400+ Pyth price feeds for real-time market data ✨
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPriceFeed} onValueChange={setSelectedPriceFeed}>
                <SelectTrigger className="rounded-2xl border-2 border-[#00B5E6] font-medium shadow-sm">
                  <SelectValue placeholder="Select a price feed" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 border-[#00B5E6]">
                  {PRICE_FEEDS.map((feed) => (
                    <SelectItem key={feed.id} value={feed.id}>
                      {feed.symbol} - {feed.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Timeframe Selector */}
          <Card className="border-4 border-[#DC9F69] rounded-3xl shadow-lg bg-gradient-to-br from-[#DC9F69]/20 to-orange-50">
            <CardHeader>
              <CardTitle className="text-[#7E533D] font-black">⏱️ Intervalo de Actualización</CardTitle>
              <CardDescription className="text-[#7E533D] font-medium">
                Selecciona la frecuencia de actualización de precios 🔄
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                <Button 
                  variant={timeframe === 1 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(1)}
                  className="rounded-2xl border-2 font-bold shadow-sm hover:shadow-md transition-all"
                >
                  1 seg
                </Button>
                <Button 
                  variant={timeframe === 3 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(3)}
                  className="rounded-2xl border-2 font-bold shadow-sm hover:shadow-md transition-all"
                >
                  3 seg
                </Button>
                <Button 
                  variant={timeframe === 15 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(15)}
                  className="rounded-2xl border-2 font-bold shadow-sm hover:shadow-md transition-all"
                >
                  15 seg
                </Button>
                <Button 
                  variant={timeframe === 60 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(60)}
                  className="rounded-2xl border-2 font-bold shadow-sm hover:shadow-md transition-all"
                >
                  1 min
                </Button>
                <Button 
                  variant={timeframe === 180 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(180)}
                  className="rounded-2xl border-2 font-bold shadow-sm hover:shadow-md transition-all"
                >
                  3 min
                </Button>
                <Button 
                  variant={timeframe === 900 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(900)}
                  className="rounded-2xl border-2 font-bold shadow-sm hover:shadow-md transition-all"
                >
                  15 min
                </Button>
                <Button 
                  variant={timeframe === 3600 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(3600)}
                  className="rounded-2xl border-2 font-bold shadow-sm hover:shadow-md transition-all"
                >
                  1 hora
                </Button>
                <Button 
                  variant={timeframe === 14400 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(14400)}
                  className="rounded-2xl border-2 font-bold shadow-sm hover:shadow-md transition-all"
                >
                  4 horas
                </Button>
              </div>
              <p className="text-xs text-[#7E533D] font-medium mt-3 bg-white/80 rounded-2xl px-3 py-2 border-2 border-[#DC9F69]">
                ⚡ Actualizando cada {timeframe < 60 ? `${timeframe} segundos` : timeframe === 60 ? '1 minuto' : timeframe < 3600 ? `${timeframe / 60} minutos` : `${timeframe / 3600} horas`}
              </p>
            </CardContent>
          </Card>

          {/* Current Price Card */}
          <Card className="border-4 border-[#7E533D] rounded-3xl shadow-xl bg-gradient-to-br from-[#DC9F69]/20 via-orange-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-[#7E533D] font-black">
                <span>💰 {selectedFeed?.symbol}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchPrice}
                  disabled={isPolling}
                  className="rounded-2xl border-2 border-[#7E533D] shadow-sm hover:shadow-md transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
              <CardDescription className="text-[#7E533D] font-medium">Real-time price from Hermes ✨</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white/80 rounded-3xl p-4 border-4 border-[#DC9F69] shadow-lg">
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7E533D] to-[#D92B29]">
                    ${formatPrice(displayPrice, 2)}
                  </div>
                  {currentPrice && (
                    <div className="text-sm text-[#7E533D] font-medium mt-2">
                      🕒 Updated: {formatTimestamp(currentPrice.publishTime)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleUpdatePrice} 
                      disabled={!isWalletConnected || isUpdatingPrice}
                      className="flex-1 rounded-2xl border-2 border-[#3E9138] shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-[#3E9138] to-[#00B5E6] text-white font-bold"
                    >
                      {isUpdatingPrice ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Update On-Chain
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={handleGetOnChainPrice}
                      disabled={!isWalletConnected}
                      variant="outline"
                      className="flex-1 rounded-2xl border-2 border-[#00B5E6] shadow-sm hover:shadow-md transition-all font-bold hover:bg-[#00B5E6]/10"
                    >
                      🔍 Read On-Chain
                    </Button>
                  </div>
                  <Button 
                    onClick={getAIRecommendation}
                    disabled={isGettingRecommendation || priceHistory.length < 5}
                    className="w-full rounded-2xl border-2 border-[#D92B29] shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-[#D92B29] to-[#DC9F69] text-white font-bold"
                  >
                    {isGettingRecommendation ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        🤖 Recomendación de IA ✨
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendation Card */}
          {aiRecommendation && (
            <Card className="border-4 border-[#DC9F69] rounded-3xl shadow-xl bg-gradient-to-br from-[#DC9F69]/30 via-orange-50 to-yellow-50 animate-in fade-in duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#7E533D] font-black">
                  🤖 Recomendación de IA 💡
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setAiRecommendation(null)}
                    className="ml-auto rounded-2xl hover:bg-[#D92B29]/10 border-2 border-[#D92B29]"
                  >
                    ✕
                  </Button>
                </CardTitle>
                <CardDescription className="text-[#7E533D] font-medium">Análisis en tiempo real de {selectedFeed?.symbol} ✨</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/90 border-4 border-[#DC9F69] rounded-3xl p-4 whitespace-pre-wrap font-mono text-sm shadow-inner">
                  {aiRecommendation}
                </div>
                <p className="text-xs text-[#7E533D] font-bold mt-3 bg-[#DC9F69]/20 rounded-2xl px-3 py-2 border-2 border-[#DC9F69]">
                  ⚠️ Esta es una recomendación generada por IA y no constituye asesoría financiera. 
                  Siempre haz tu propia investigación antes de tomar decisiones de inversión 📊
                </p>
              </CardContent>
            </Card>
          )}

          {/* Price Chart */}
          <Card className="border-4 border-[#00B5E6] rounded-3xl shadow-lg bg-gradient-to-br from-[#00B5E6]/20 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-[#7E533D] font-black">📈 Price History</CardTitle>
              <CardDescription className="text-[#7E533D] font-medium">
                Movimiento de precio en tiempo real desde Hermes 🔄
                {priceHistory.length > 0 && ` • ${priceHistory.length} puntos de datos ✨`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white/80 rounded-3xl p-4 border-2 border-[#00B5E6]">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00B5E6" opacity={0.3} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(ts) => new Date(ts * 1000).toLocaleTimeString()}
                      stroke="#7E533D"
                    />
                    <YAxis domain={['auto', 'auto']} stroke="#7E533D" />
                    <Tooltip 
                      labelFormatter={(ts) => new Date((ts as number) * 1000).toLocaleString()}
                      formatter={(value: any) => ['$' + formatPrice(value, 2), 'Price']}
                      contentStyle={{ borderRadius: '1rem', border: '2px solid #DC9F69' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="url(#colorGradient)" 
                      strokeWidth={3}
                      dot={false}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#DC9F69" />
                        <stop offset="50%" stopColor="#D92B29" />
                        <stop offset="100%" stopColor="#00B5E6" />
                      </linearGradient>
                    </defs>
                </LineChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
