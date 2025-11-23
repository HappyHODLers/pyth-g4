# PythAI Trading Agent - Submission for Pyth Network Hackathon

## Project Overview

**PythAI Trading Agent & Dashboard** is an all-in-one application demonstrating both Pyth Network Price Feeds (Pull Oracle) and Pyth Entropy (Verifiable Randomness). The project features an AI-powered chatbot agent to guide developers in building innovative dApps using Pyth's infrastructure.

## Prize Categories

This submission qualifies for:
1. ⛓️ **Most Innovative use of Pyth Pull Price Feeds** ($10,000 prize pool)
2. 🎲 **Pyth Entropy Pool Prize** ($5,000 prize pool)
3. 🔮 **Best use of Pyth Entropy** (Up to $5,000)

## What Makes This Innovative

### 1. Complete Pull Oracle Implementation
- Full demonstration of Fetch → Update → Consume workflow
- Real-time price visualization from Hermes
- Interactive on-chain updates
- Multi-asset support (crypto, equities, commodities)

### 2. AI-Powered Developer Experience
- ChatGPT-style interface for Pyth Network guidance
- Suggests innovative use cases combining Price Feeds and Entropy
- Helps developers discover new dApp ideas
- Lowers the barrier to entry for new builders

### 3. Verifiable Randomness Integration
- Complete Entropy implementation with visual tracking
- Practical examples (dice rolls, lottery numbers, ranges)
- Demonstrates security and fairness

### 4. Educational Tool
- Serves as a reference implementation for other developers
- Clear code structure with comprehensive comments
- Step-by-step workflow explanations in the UI

## Technical Implementation

### Pyth Price Feeds
```typescript
// 1. Fetch from Hermes
const updateData = await priceService.getPriceFeedsUpdateData([priceFeedId]);

// 2. Update on-chain
const tx = await pythContract.updatePriceFeeds(updateData, { value: updateFee });

// 3. Consume price
const priceData = await pythContract.getPriceNoOlderThan(priceFeedId, 60);
```

### Pyth Entropy
```typescript
// Request random number
const tx = await entropyContract.request(provider, userRandom, true, { value: fee });

// Retrieve random number
const randomNumber = await getGeneratedRandomNumber(requestId, provider);
```

## Use Cases Demonstrated

### Price Feeds
- Real-time market data visualization
- On-chain price updates for DeFi protocols
- Multi-asset tracking
- Historical price charts

### Entropy
- Fair lottery systems
- Gaming randomness (dice rolls, loot drops)
- NFT trait randomization
- Random sampling for protocols

### Combined Price Feeds + Entropy
- Volatility-based game mechanics
- Dynamic NFT traits tied to market conditions
- Random events triggered by price movements
- Fair prediction market resolution

## Technical Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Blockchain:** Ethers.js v6
- **Pyth SDK:** @pythnetwork/price-service-client, @pythnetwork/pyth-evm-js
- **UI:** Tailwind CSS + Shadcn/ui
- **State:** Zustand
- **AI:** DeepSeek API

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Live Demo

[Add your deployed link here]

## Video Demo

[Add your video demo link here]

## Screenshots

### AI Chatbot Interface
The chatbot provides expert guidance on Pyth Network implementation and suggests innovative use cases.

### Price Feeds Dashboard
Real-time price tracking with complete Pull Oracle workflow demonstration.

### Entropy Random Number Generator
Verifiable on-chain randomness with practical examples.

## Future Enhancements

1. **Multi-chain Support:** Expand to more EVM chains supported by Pyth
2. **Advanced Analytics:** Add volatility indicators, correlation metrics
3. **Smart Contract Templates:** Generate deployable contracts for common use cases
4. **Portfolio Tracking:** Track multiple assets with alerts
5. **Entropy Games:** Mini-games showcasing fair randomness

## Why This Deserves to Win

1. **Complete Implementation:** Both Price Feeds and Entropy fully integrated
2. **Innovation:** AI assistant helps developers discover new use cases
3. **Educational Value:** Serves as reference for the community
4. **Production Ready:** Clean code, comprehensive documentation
5. **User Experience:** Beautiful UI with intuitive workflow
6. **Extensibility:** Easy to build upon for real-world applications

## Team

[Your name/team name]

## Links

- GitHub Repository: [link]
- Live Demo: [link]
- Video Demo: [link]
- Documentation: See README.md

## License

MIT

---

**Note:** This project is submitted to the Pyth Network Hackathon and is ready for PR submission to the `pyth-network/pyth-examples` repository as required for Entropy prize qualification.
