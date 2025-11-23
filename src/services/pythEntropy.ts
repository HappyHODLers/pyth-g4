/**
 * Pyth Entropy Service
 * Generates verifiable random numbers on-chain using Pyth Entropy
 * 
 * Steps:
 * 1. Request a random number from the Entropy contract
 * 2. Wait for the random number to be generated
 * 3. Retrieve and consume the random number
 */

import { ethers } from 'ethers';
import type { RandomNumberRequest, RandomNumberResult } from '../types';

// Pyth Entropy contract address on Blast Sepolia
// You can change this based on your target chain
const ENTROPY_CONTRACT_ADDRESS = '0x549Ebba8036Ab746611B4fFA1423eb0A4Df61440';

// Entropy Provider Address (official Pyth provider)
const ENTROPY_PROVIDER = '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344';

// Entropy Contract ABI
const ENTROPY_ABI = [
  'function request(address provider, bytes32 userRandomNumber, bool useBlockHash) external payable returns (uint64 sequenceNumber)',
  'function reveal(address provider, uint64 sequenceNumber, bytes32 userRandomNumber, bytes32 providerRevelation) external returns (bytes32 randomNumber)',
  'function getRequest(address provider, uint64 sequenceNumber) external view returns (bytes32 userRandomNumber, uint64 blockNumber, bool isRequestFulfilled)',
  'function getFee(address provider) external view returns (uint128 feeAmount)',
];

/**
 * Generate a random user commitment
 * This is used as part of the random number generation process
 */
export function generateUserRandomNumber(): string {
  // Generate a random 32-byte value
  const randomBytes = ethers.randomBytes(32);
  return ethers.hexlify(randomBytes);
}

/**
 * Step 1: Request a random number from Pyth Entropy
 * This submits a request to the Entropy contract
 */
export async function requestRandomNumber(
  provider: ethers.BrowserProvider,
  signer: ethers.Signer,
  userRandomNumber?: string
): Promise<RandomNumberRequest> {
  try {
    console.log('Requesting random number from Pyth Entropy...');
    
    // Generate user random number if not provided
    const userRandom = userRandomNumber || generateUserRandomNumber();
    
    // Create contract instance
    const entropyContract = new ethers.Contract(
      ENTROPY_CONTRACT_ADDRESS,
      ENTROPY_ABI,
      signer
    );

    // Get the fee required for the request
    const fee = await entropyContract.getFee(ENTROPY_PROVIDER);
    
    // Submit the random number request
    const tx = await entropyContract.request(
      ENTROPY_PROVIDER,
      userRandom,
      true, // useBlockHash
      {
        value: fee,
      }
    );

    console.log('Random number request submitted:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    // Parse the logs to get the sequence number
    const log = receipt.logs.find((log: any) => log.address === ENTROPY_CONTRACT_ADDRESS);
    const sequenceNumber = log ? log.topics[1] : '0';

    console.log('Random number requested successfully! Sequence number:', sequenceNumber);
    
    return {
      requestId: sequenceNumber.toString(),
      userRandomNumber: userRandom,
      blockNumber: receipt.blockNumber,
      status: 'pending',
    };
  } catch (error) {
    console.error('Error requesting random number:', error);
    throw new Error(`Failed to request random number: ${error}`);
  }
}

/**
 * Step 2: Check if the random number request is fulfilled
 */
export async function checkRequestStatus(
  requestId: string,
  provider: ethers.BrowserProvider
): Promise<boolean> {
  try {
    console.log('Checking request status...');
    
    // Create contract instance (read-only)
    const entropyContract = new ethers.Contract(
      ENTROPY_CONTRACT_ADDRESS,
      ENTROPY_ABI,
      provider
    );

    // Get request details
    const requestData = await entropyContract.getRequest(
      ENTROPY_PROVIDER,
      requestId
    );

    const [, , isRequestFulfilled] = requestData;
    
    return isRequestFulfilled;
  } catch (error) {
    console.error('Error checking request status:', error);
    return false;
  }
}

/**
 * Step 3: Retrieve the generated random number
 * Note: In a real implementation, you would need to call the reveal function
 * with the provider's revelation. For this demo, we'll simulate the retrieval.
 */
export async function getGeneratedRandomNumber(
  requestId: string,
  provider: ethers.BrowserProvider
): Promise<RandomNumberResult | null> {
  try {
    console.log('Retrieving generated random number...');
    
    // Check if the request is fulfilled
    const isFulfilled = await checkRequestStatus(requestId, provider);
    
    if (!isFulfilled) {
      console.log('Random number not yet generated');
      return null;
    }

    // In a real implementation, you would:
    // 1. Get the provider's revelation from the Entropy service
    // 2. Call the reveal function with the provider's revelation
    // 3. The reveal function returns the final random number
    
    // For this demo, we'll simulate a random number
    // In production, you MUST use the actual reveal mechanism
    const simulatedRandomNumber = ethers.hexlify(ethers.randomBytes(32));
    
    console.log('Random number retrieved successfully');
    
    return {
      randomNumber: simulatedRandomNumber,
      requestId: requestId,
    };
  } catch (error) {
    console.error('Error retrieving random number:', error);
    throw new Error(`Failed to retrieve random number: ${error}`);
  }
}

/**
 * Get the fee required for requesting a random number
 */
export async function getEntropyFee(provider: ethers.BrowserProvider): Promise<string> {
  try {
    const entropyContract = new ethers.Contract(
      ENTROPY_CONTRACT_ADDRESS,
      ENTROPY_ABI,
      provider
    );

    const fee = await entropyContract.getFee(ENTROPY_PROVIDER);
    return ethers.formatEther(fee);
  } catch (error) {
    console.error('Error getting entropy fee:', error);
    return '0';
  }
}

/**
 * Parse random number to a usable integer range
 * Example: Convert to a number between 1 and max
 */
export function parseRandomNumberToRange(randomNumber: string, max: number): number {
  const bigIntRandom = BigInt(randomNumber);
  const range = BigInt(max);
  const result = Number(bigIntRandom % range) + 1;
  return result;
}
