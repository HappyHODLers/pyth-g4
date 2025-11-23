# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- React + TypeScript
- Pyth Network SDKs
- Ethers.js for blockchain interaction
- Tailwind CSS for styling
- Recharts for data visualization

### Step 2: Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 3: Connect Your Wallet
1. Open the app in your browser
2. Click "Connect Wallet" button
3. Approve the connection in MetaMask
4. Switch to a supported testnet (Ethereum Sepolia recommended)

### Step 4: Get Test ETH
You need test ETH for on-chain transactions:

**Ethereum Sepolia:**
- https://sepoliafaucet.com/
- https://www.infura.io/faucet/sepolia

**Blast Sepolia (for Entropy):**
- https://blastapi.io/faucets/blast-sepolia

### Step 5: Explore Features

#### Price Feeds
1. Select a price feed (BTC/USD, ETH/USD, etc.)
2. Watch real-time prices update automatically
3. Click "Update On-Chain" to submit price data to blockchain
4. Click "Read On-Chain Price" to verify the stored price

#### Entropy
1. Switch to the "Entropy" tab
2. Click "Request Random Number"
3. Approve the transaction
4. Wait for the random number to be generated (~30 seconds)
5. View the result and example conversions

#### AI Chatbot
1. Ask questions in the chat interface
2. Get expert guidance on Pyth Network
3. Discover innovative use cases

## 🔧 Troubleshooting

### "Cannot find module" errors
Run `npm install` again to ensure all dependencies are installed.

### Transaction failing
- Make sure you have enough test ETH for gas fees
- Verify you're on the correct network (Sepolia for Price Feeds, Blast Sepolia for Entropy)
- Check that the price feed ID is valid

### Wallet not connecting
- Ensure MetaMask is installed
- Try refreshing the page
- Check that MetaMask is not locked

### Build errors
If you encounter TypeScript errors during build:
```bash
npm run build -- --mode development
```

## 📝 Key Files to Explore

- `src/services/pythPriceFeeds.ts` - Price feed integration
- `src/services/pythEntropy.ts` - Entropy integration
- `src/components/Dashboard.tsx` - Main dashboard UI
- `src/components/Chatbot.tsx` - AI chat interface

## 🌐 Network Configuration

Default networks:
- **Price Feeds:** Ethereum Sepolia (`0xDd24F84d36BF92C65F92307595335bdFab5Bbd21`)
- **Entropy:** Blast Sepolia (`0x549Ebba8036Ab746611B4fFA1423eb0A4Df61440`)

To change networks, update contract addresses in the service files.

## 🎯 Next Steps

1. **Customize:** Modify the price feeds list in `pythPriceFeeds.ts`
2. **Extend:** Add more features using the AI chatbot for ideas
3. **Deploy:** Run `npm run build` to create a production build
4. **Submit:** Prepare your hackathon submission with screenshots and video

## 💡 Pro Tips

- Use the AI chatbot to learn about advanced Pyth features
- Combine Price Feeds and Entropy for innovative applications
- Check the console for detailed logs during development
- Read the comprehensive README.md for full documentation

---

**Need Help?** Check the full README.md or ask the AI chatbot in the app!
