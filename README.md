# HappyHODLers Agent & Dashboard

![Pyth Network](https://img.shields.io/badge/Pyth-Network-purple)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

An all-in-one application showcasing **Pyth Network's Price Feeds (Pull Oracle)** and **Entropy (Verifiable Randomness)** for the Pyth Network Hackathon. This project combines real-time financial data visualization with an AI-powered chatbot to help developers build innovative dApps.

## 🎯 Hackathon Prize Categories

This project is designed to qualify for multiple Pyth Network hackathon prizes:

✅ **Most Innovative use of Pyth Pull Price Feeds** ($10,000 prize pool)
- Implements complete Pull Oracle workflow: Fetch → Update → Consume
- Real-time price feeds from Hermes
- On-chain price updates via `updatePriceFeeds`
- Interactive dashboard with price charts

✅ **Pyth Entropy Pool Prize** ($5,000 prize pool)
- Complete integration of Pyth Entropy for random number generation
- Demonstrates request → generate → consume workflow
- Example use cases and practical implementations

✅ **Best use of Pyth Entropy** (Up to $5,000)
- Innovative applications combining Price Feeds and Entropy
- AI assistant suggesting creative use cases

## 🚀 Features

### 1. **AI-Powered Chatbot Agent**
- Interactive chat interface with DeepSeek AI
- Expert guidance on Pyth Network implementation
- Suggests innovative use cases combining Price Feeds and Entropy
- Works in demo mode without API key

### 2. **Price Feeds Dashboard**
- **Real-time price tracking** for BTC/USD, ETH/USD, SOL/USD, AAPL/USD, and more
- **Complete Pull Oracle demonstration:**
  1. Fetch data from Hermes API
  2. Update on-chain using Pyth contract
  3. Consume price from blockchain
- **Interactive price chart** showing historical data
- **Multi-chain support** (Ethereum, Blast, and more)

### 3. **Entropy Random Number Generator**
- Request verifiable random numbers on-chain
- Visual status tracking (pending/fulfilled)
- Example conversions (dice rolls, lottery numbers)
- Demonstrates cryptographic security

## 🏗️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Shadcn/ui components
- **State Management:** Zustand
- **Charts:** Recharts
- **Blockchain:** Ethers.js v6
- **Pyth Integration:**
  - `@pythnetwork/price-service-client` - Price feeds
  - `@pythnetwork/pyth-evm-js` - Contract interactions
- **AI:** DeepSeek API (optional, falls back to demo mode)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- MetaMask or another Web3 wallet
- Test ETH on Ethereum Sepolia or Blast Sepolia (for on-chain interactions)

### Setup

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/pythai-trading-agent.git
cd pythai-trading-agent
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:5173`

5. **Connect your wallet:**
Click "Connect Wallet" to interact with Pyth contracts on-chain

## 🎮 Usage Guide

### Getting Started

1. **Connect Your Wallet**
   - Click the "Connect Wallet" button
   - Approve the connection in MetaMask
   - Make sure you're on a supported network (Ethereum Sepolia recommended)

2. **Explore Price Feeds**
   - Select a price feed from the dropdown (BTC/USD, ETH/USD, etc.)
   - View real-time prices fetched from Hermes
   - Click "Update On-Chain" to submit price data to the blockchain
   - Click "Read On-Chain Price" to verify the stored price

3. **Generate Random Numbers**
   - Switch to the "Entropy" tab
   - Click "Request Random Number"
   - Approve the transaction in your wallet
   - Wait for the random number to be fulfilled
   - View the generated number and example conversions

4. **Chat with the AI Assistant**
   - Ask questions about Pyth Network
   - Get implementation guidance
   - Discover innovative use cases
   - Learn about combining Price Feeds and Entropy

### Example Questions for the AI Agent

- "How do Pyth Price Feeds work?"
- "What can I build with Pyth Entropy?"
- "Suggest ways to combine price feeds and randomness"
- "Best practices for using Pyth in DeFi"

## 🔧 Configuration

### Optional: DeepSeek API Key

For enhanced AI responses, add your DeepSeek API key:

1. Get an API key from [DeepSeek Platform](https://platform.deepseek.com)
2. Click the Settings icon (⚙️) in the top-right
3. Enter your API key
4. Click "Save Settings"

**Note:** The app works in demo mode without an API key, providing pre-configured responses.

### Network Configuration

The app is pre-configured for:
- **Price Feeds:** Ethereum Sepolia
- **Entropy:** Blast Sepolia

To change networks, update the contract addresses in:
- `src/services/pythPriceFeeds.ts` - Line 13 (PYTH_CONTRACT_ADDRESS)
- `src/services/pythEntropy.ts` - Line 14 (ENTROPY_CONTRACT_ADDRESS)

Supported networks: [Pyth Contract Addresses](https://docs.pyth.network/price-feeds/core/contract-addresses/evm)

## 📚 Pyth Integration Details

### Price Feeds (Pull Oracle)

This project implements the complete Pull Oracle workflow as required by the hackathon:

**Step 1: Fetch from Hermes**
```typescript
const updateData = await priceService.getPriceFeedsUpdateData([priceFeedId]);
```

**Step 2: Update On-Chain**
```typescript
const tx = await pythContract.updatePriceFeeds(updateData, { value: updateFee });
```

**Step 3: Consume Price**
```typescript
const priceData = await pythContract.getPriceNoOlderThan(priceFeedId, 60);
```

### Entropy (Random Numbers)

**Request Random Number:**
```typescript
const tx = await entropyContract.request(
  ENTROPY_PROVIDER,
  userRandomNumber,
  true, // useBlockHash
  { value: fee }
);
```

**Retrieve Random Number:**
```typescript
const randomNumber = await getGeneratedRandomNumber(requestId, provider);
```

## 🏆 Hackathon Qualification Checklist

### Pull Price Feeds ✅
- [x] Fetch data from Hermes API
- [x] Update data on-chain using `updatePriceFeeds`
- [x] Consume the price from the contract
- [x] Comprehensive EVM implementation

### Pyth Entropy ✅
- [x] Request random numbers on-chain
- [x] Consume generated random numbers
- [x] Follow best practices
- [x] Working code with detailed README
- [x] Ready for PR submission to `pyth-network/pyth-examples`

## 🎨 UI Components

Built with Shadcn/ui for a polished, professional interface:
- **Cards** - Information display
- **Tabs** - Navigation between Price Feeds and Entropy
- **Buttons** - Interactive actions
- **Select** - Price feed selection
- **Input** - Chat and settings
- **Charts** - Real-time price visualization

## 🔗 Resources

- [Pyth Network Documentation](https://docs.pyth.network/)
- [Pyth EVM Integration Guide](https://docs.pyth.network/price-feeds/core/use-real-time-data/pull-integration/evm)
- [Pyth Entropy Guide](https://docs.pyth.network/entropy/generate-random-numbers/evm)
- [Supported Price Feeds](https://docs.pyth.network/price-feeds/core/price-feeds/price-feed-ids)
- [Contract Addresses](https://docs.pyth.network/price-feeds/core/contract-addresses/evm)
- [DeepSeek API](https://platform.deepseek.com)

## 🛠️ Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

## 📝 Project Structure

```
pythai-trading-agent/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── Chatbot.tsx      # AI chat interface
│   │   └── Dashboard.tsx    # Price feeds & entropy dashboard
│   ├── services/
│   │   ├── pythPriceFeeds.ts   # Price feed integration
│   │   ├── pythEntropy.ts      # Entropy integration
│   │   └── aiChat.ts           # DeepSeek AI service
│   ├── store/
│   │   └── appStore.ts      # Zustand state management
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── utils/
│   │   └── helpers.ts       # Utility functions
│   ├── App.tsx              # Main application
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🤝 Contributing

This project is open-source and built for the Pyth Network Hackathon. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Pyth Network** - For providing world-class oracle infrastructure
- **DeepSeek** - AI-powered developer assistance
- **Shadcn/ui** - Beautiful component library
- **The Ethereum Community** - For Web3 tooling

## 📧 Contact

Built with ❤️ for the Pyth Network Hackathon

For questions or collaboration:
- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@yourtwitter](https://twitter.com/yourtwitter)

---

**Note:** This is a hackathon project demonstrating Pyth Network integrations. For production use, ensure proper error handling, security audits, and gas optimization.
