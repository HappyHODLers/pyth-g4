/**
 * Dashboard Component
 * Displays Pyth Price Feeds and Entropy integrations
 */

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { RefreshCw, TrendingUp, Dice6, CheckCircle2, Clock, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
import {
  requestRandomNumber,
  checkRequestStatus,
  getGeneratedRandomNumber,
  parseRandomNumberToRange,
} from '../services/pythEntropy';
import { formatPrice, formatTimestamp } from '../utils/helpers';

export function Dashboard() {
  const {
    selectedPriceFeed,
    setSelectedPriceFeed,
    currentPrice,
    setCurrentPrice,
    priceHistory,
    addPriceToHistory,
    randomNumberRequest,
    setRandomNumberRequest,
    generatedRandomNumber,
    setGeneratedRandomNumber,
    isUpdatingPrice,
    setIsUpdatingPrice,
    isRequestingRandom,
    setIsRequestingRandom,
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

  // Request random number
  const handleRequestRandom = async () => {
    if (!provider || !signer) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsRequestingRandom(true);
    try {
      const request = await requestRandomNumber(provider, signer);
      setRandomNumberRequest(request);
      setGeneratedRandomNumber(null);
      
      alert(`Random number requested! Request ID: ${request.requestId}\nWaiting for fulfillment...`);
      
      // Start polling for result
      pollForRandomNumber(request.requestId);
    } catch (error) {
      console.error('Error requesting random number:', error);
      alert('Failed to request random number. See console for details.');
    } finally {
      setIsRequestingRandom(false);
    }
  };

  // Poll for random number result
  const pollForRandomNumber = async (requestId: string) => {
    if (!provider) return;

    const maxAttempts = 10;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.log('Stopped polling for random number');
        return;
      }

      try {
        const result = await getGeneratedRandomNumber(requestId, provider);
        
        if (result) {
          setGeneratedRandomNumber(result.randomNumber);
          setRandomNumberRequest(prev => prev ? { ...prev, status: 'fulfilled' } : null);
          alert(`Random number generated: ${result.randomNumber}`);
          return;
        }

        attempts++;
        setTimeout(poll, 5000); // Poll every 5 seconds
      } catch (error) {
        console.error('Error polling for random number:', error);
      }
    };

    poll();
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Connect your wallet to interact with Pyth contracts on-chain
              </p>
              <Button onClick={connectWallet}>
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Connected: <span className="font-mono">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="price-feeds" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="price-feeds">Price Feeds</TabsTrigger>
          <TabsTrigger value="entropy">Entropy</TabsTrigger>
        </TabsList>

        {/* Price Feeds Tab */}
        <TabsContent value="price-feeds" className="space-y-4">
          {/* Price Feed Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Price Feed</CardTitle>
              <CardDescription>
                Choose from 400+ Pyth price feeds for real-time market data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPriceFeed} onValueChange={setSelectedPriceFeed}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a price feed" />
                </SelectTrigger>
                <SelectContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Intervalo de Actualización</CardTitle>
              <CardDescription>
                Selecciona la frecuencia de actualización de precios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                <Button 
                  variant={timeframe === 1 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(1)}
                >
                  1 seg
                </Button>
                <Button 
                  variant={timeframe === 3 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(3)}
                >
                  3 seg
                </Button>
                <Button 
                  variant={timeframe === 15 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(15)}
                >
                  15 seg
                </Button>
                <Button 
                  variant={timeframe === 60 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(60)}
                >
                  1 min
                </Button>
                <Button 
                  variant={timeframe === 180 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(180)}
                >
                  3 min
                </Button>
                <Button 
                  variant={timeframe === 900 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(900)}
                >
                  15 min
                </Button>
                <Button 
                  variant={timeframe === 3600 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(3600)}
                >
                  1 hora
                </Button>
                <Button 
                  variant={timeframe === 14400 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeframe(14400)}
                >
                  4 horas
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ⚡ Actualizando cada {timeframe < 60 ? `${timeframe} segundos` : timeframe === 60 ? '1 minuto' : timeframe < 3600 ? `${timeframe / 60} minutos` : `${timeframe / 3600} horas`}
              </p>
            </CardContent>
          </Card>

          {/* Current Price Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedFeed?.symbol}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchPrice}
                  disabled={isPolling}
                >
                  <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
              <CardDescription>Real-time price from Hermes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-bold text-primary">
                    ${formatPrice(displayPrice, 2)}
                  </div>
                  {currentPrice && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Updated: {formatTimestamp(currentPrice.publishTime)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleUpdatePrice} 
                      disabled={!isWalletConnected || isUpdatingPrice}
                      className="flex-1"
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
                      className="flex-1"
                    >
                      Read On-Chain Price
                    </Button>
                  </div>
                  <Button 
                    onClick={getAIRecommendation}
                    disabled={isGettingRecommendation || priceHistory.length < 5}
                    variant="secondary"
                    className="w-full"
                  >
                    {isGettingRecommendation ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        🤖 Recomendación de IA
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendation Card */}
          {aiRecommendation && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 Recomendación de IA
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setAiRecommendation(null)}
                    className="ml-auto"
                  >
                    ✕
                  </Button>
                </CardTitle>
                <CardDescription>Análisis en tiempo real de {selectedFeed?.symbol}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
                  {aiRecommendation}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  ⚠️ Esta es una recomendación generada por IA y no constituye asesoría financiera. 
                  Siempre haz tu propia investigación antes de tomar decisiones de inversión.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>
                Movimiento de precio en tiempo real desde Hermes
                {priceHistory.length > 0 && ` • ${priceHistory.length} puntos de datos`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(ts) => new Date(ts * 1000).toLocaleTimeString()}
                  />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip 
                    labelFormatter={(ts) => new Date((ts as number) * 1000).toLocaleString()}
                    formatter={(value: any) => ['$' + formatPrice(value, 2), 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pull Oracle Workflow Explanation */}
          <Card>
            <CardHeader>
              <CardTitle>Pyth Pull Oracle Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <strong>Fetch from Hermes:</strong> Price data is retrieved from Pyth's Hermes API
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <strong>Update On-Chain:</strong> Submit price data to the Pyth contract using updatePriceFeeds
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <strong>Consume Price:</strong> Your smart contract reads the fresh price from the Pyth contract
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entropy Tab */}
        <TabsContent value="entropy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dice6 className="w-6 h-6" />
                Pyth Entropy Random Number Generator
              </CardTitle>
              <CardDescription>
                Generate verifiable random numbers on-chain with cryptographic security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleRequestRandom}
                disabled={!isWalletConnected || isRequestingRandom}
                className="w-full"
                size="lg"
              >
                {isRequestingRandom ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Dice6 className="w-5 h-5 mr-2" />
                    Request Random Number
                  </>
                )}
              </Button>

              {randomNumberRequest && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Request Status</span>
                    <div className={`flex items-center gap-2 text-sm ${
                      randomNumberRequest.status === 'fulfilled' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {randomNumberRequest.status === 'fulfilled' ? (
                        <><CheckCircle2 className="w-4 h-4" /> Fulfilled</>
                      ) : (
                        <><Clock className="w-4 h-4" /> Pending</>
                      )}
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div><strong>Request ID:</strong> {randomNumberRequest.requestId}</div>
                    <div><strong>Block:</strong> {randomNumberRequest.blockNumber}</div>
                  </div>
                </div>
              )}

              {generatedRandomNumber && (
                <div className="border rounded-lg p-4 space-y-3 bg-primary/5">
                  <div className="text-sm font-medium">Generated Random Number</div>
                  <div className="font-mono text-xs break-all bg-background p-2 rounded">
                    {generatedRandomNumber}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="border rounded p-2">
                      <div className="text-xs text-muted-foreground">1-100</div>
                      <div className="text-lg font-bold text-primary">
                        {parseRandomNumberToRange(generatedRandomNumber, 100)}
                      </div>
                    </div>
                    <div className="border rounded p-2">
                      <div className="text-xs text-muted-foreground">1-1000</div>
                      <div className="text-lg font-bold text-primary">
                        {parseRandomNumberToRange(generatedRandomNumber, 1000)}
                      </div>
                    </div>
                    <div className="border rounded p-2">
                      <div className="text-xs text-muted-foreground">1-6 (Dice)</div>
                      <div className="text-lg font-bold text-primary">
                        {parseRandomNumberToRange(generatedRandomNumber, 6)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entropy Use Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Use Cases for Pyth Entropy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <strong>Gaming:</strong> Fair loot drops, enemy spawns, procedural generation
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <strong>NFTs:</strong> Randomized traits, reveal mechanics, generative art
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎲</span>
                  <div>
                    <strong>Lotteries:</strong> Provably fair winner selection, prize distribution
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <strong>DeFi:</strong> Random sampling, fair liquidations, dynamic yields
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
