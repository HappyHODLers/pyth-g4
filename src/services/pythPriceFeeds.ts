/**
 * Pyth Price Feeds Service
 * Implements the Pull Oracle method for Pyth Network
 * 
 * Steps:
 * 1. Fetch price data from Hermes
 * 2. Update price on-chain using updatePriceFeeds
 * 3. Consume the price from the contract
 */

import { ethers } from 'ethers';
import type { PriceData } from '../types';
import axios from 'axios';

// Hermes endpoint for price data
const HERMES_ENDPOINT = 'https://hermes.pyth.network';

// Pyth contract address on Ethereum Sepolia (change based on your target chain)
const PYTH_CONTRACT_ADDRESS = '0xDd24F84d36BF92C65F92307595335bdFab5Bbd21';

// Pyth Contract ABI (minimal interface for price feeds)
const PYTH_ABI = [
  'function updatePriceFeeds(bytes[] calldata updateData) external payable',
  'function getPrice(bytes32 id) external view returns (int64 price, uint64 conf, int32 expo, uint256 publishTime)',
  'function getPriceNoOlderThan(bytes32 id, uint256 age) external view returns (int64 price, uint64 conf, int32 expo, uint256 publishTime)',
  'function getUpdateFee(bytes[] calldata updateData) external view returns (uint256 feeAmount)',
];

/**
 * Step 1: Fetch price data from Hermes
 * This retrieves the latest price update data from the Pyth Hermes API
 */
export async function fetchPriceFromHermes(priceFeedId: string): Promise<string[]> {
  try {
    console.log(`Fetching price for ${priceFeedId} from Hermes...`);
    
    // Get the price update data from Hermes REST API
    const response = await axios.get(
      `${HERMES_ENDPOINT}/v2/updates/price/latest`,
      {
        params: {
          ids: [priceFeedId],
          encoding: 'hex',
        },
      }
    );
    
    if (!response.data || !response.data.binary || !response.data.binary.data) {
      throw new Error('No price feed data received from Hermes');
    }

    // Get the price update data (VAA - Verified Action Approval)
    const updateData = response.data.binary.data;
    
    console.log('Price data fetched successfully from Hermes');
    return Array.isArray(updateData) ? updateData : [updateData];
  } catch (error) {
    console.error('Error fetching price from Hermes:', error);
    throw new Error(`Failed to fetch price from Hermes: ${error}`);
  }
}

/**
 * Step 2: Update price on-chain
 * This submits the price update to the Pyth contract on-chain
 */
export async function updatePriceOnChain(
  priceFeedId: string,
  provider: ethers.BrowserProvider,
  signer: ethers.Signer
): Promise<string> {
  try {
    console.log('Updating price on-chain...');
    
    // Fetch the latest price update data from Hermes
    const updateData = await fetchPriceFromHermes(priceFeedId);
    
    // Create contract instance
    const pythContract = new ethers.Contract(
      PYTH_CONTRACT_ADDRESS,
      PYTH_ABI,
      signer
    );

    // Get the fee required for the update
    const updateFee = await pythContract.getUpdateFee(updateData);
    
    // Submit the price update transaction
    const tx = await pythContract.updatePriceFeeds(updateData, {
      value: updateFee,
    });

    console.log('Transaction submitted:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Price updated on-chain successfully!');
    
    return receipt.hash;
  } catch (error) {
    console.error('Error updating price on-chain:', error);
    throw new Error(`Failed to update price on-chain: ${error}`);
  }
}

/**
 * Step 3: Consume the price from the contract
 * This reads the latest price from the on-chain Pyth contract
 */
export async function getOnChainPrice(
  priceFeedId: string,
  provider: ethers.BrowserProvider
): Promise<PriceData> {
  try {
    console.log('Reading price from on-chain contract...');
    
    // Create contract instance (read-only)
    const pythContract = new ethers.Contract(
      PYTH_CONTRACT_ADDRESS,
      PYTH_ABI,
      provider
    );

    // Convert price feed ID to bytes32 format
    const priceFeedIdBytes32 = '0x' + priceFeedId;

    // Get the latest price (no older than 60 seconds)
    const priceData = await pythContract.getPriceNoOlderThan(
      priceFeedIdBytes32,
      60 // Max age in seconds
    );

    const [price, conf, expo, publishTime] = priceData;

    console.log('On-chain price retrieved successfully');
    
    return {
      price: price.toString(),
      expo: Number(expo),
      conf: conf.toString(),
      publishTime: Number(publishTime),
    };
  } catch (error) {
    console.error('Error reading on-chain price:', error);
    throw new Error(`Failed to read on-chain price: ${error}`);
  }
}

/**
 * Get the human-readable price from raw price data
 */
export function parsePrice(price: string, expo: number): number {
  const priceNum = parseFloat(price);
  return priceNum * Math.pow(10, expo);
}

/**
 * Fetch price directly from Hermes (for display purposes)
 * This doesn't interact with the blockchain
 */
export async function getPriceFromHermes(priceFeedId: string): Promise<PriceData> {
  try {
    // Get the latest price from Hermes REST API
    const response = await axios.get(
      `${HERMES_ENDPOINT}/v2/updates/price/latest`,
      {
        params: {
          ids: [priceFeedId],
        },
      }
    );
    
    if (!response.data || !response.data.parsed || response.data.parsed.length === 0) {
      throw new Error('No price feed data received');
    }

    const priceData = response.data.parsed[0].price;

    return {
      price: priceData.price,
      expo: priceData.expo,
      conf: priceData.conf,
      publishTime: priceData.publish_time,
    };
  } catch (error) {
    console.error('Error getting price from Hermes:', error);
    throw error;
  }
}

// Popular Pyth price feed IDs
export const PRICE_FEEDS = [
  {
    id: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
  },
  {
    id: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    symbol: 'ETH/USD',
    name: 'Ethereum',
  },
  {
    id: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
    symbol: 'USDC/USD',
    name: 'USD Coin',
  },
  {
    id: '03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
    symbol: 'SOL/USD',
    name: 'Solana',
  },
  {
    id: '49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688',
    symbol: 'AAPL/USD',
    name: 'Apple Inc',
  },
];
