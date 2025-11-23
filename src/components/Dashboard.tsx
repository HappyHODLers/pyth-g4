/**
 * Dashboard Component
 * Displays Pyth Price Feeds and Entropy integrations
 */

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { RefreshCw, TrendingUp, Dice6, CheckCircle2, Clock } from 'lucide-react';
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

  // Auto-fetch price on mount and when feed changes
  useEffect(() => {
    fetchPrice();
    
    // Start polling for price updates every 10 seconds
    const interval = setInterval(() => {
      if (!isPolling) {
        setIsPolling(true);
        fetchPrice().finally(() => setIsPolling(false));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedPriceFeed]);

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
              </div>
            </CardContent>
          </Card>

          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>Real-time price movement from Hermes</CardDescription>
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
