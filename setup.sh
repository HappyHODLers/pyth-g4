#!/bin/bash

# HappyHODLers Agent - Setup and Validation Script
# This script will install dependencies and verify the project is ready to run

echo "================================================"
echo "🚀 HappyHODLers Agent - Setup Script"
echo "================================================"
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version 18+ is recommended. You have: $(node -v)"
else
    echo "✅ Node.js version: $(node -v)"
fi

# Check npm
echo ""
echo "📋 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Verify key files exist
echo ""
echo "📋 Verifying project structure..."

FILES=(
    "src/App.tsx"
    "src/main.tsx"
    "src/components/Chatbot.tsx"
    "src/components/Dashboard.tsx"
    "src/services/pythPriceFeeds.ts"
    "src/services/pythEntropy.ts"
    "src/services/aiChat.ts"
    "src/store/appStore.ts"
    "vite.config.ts"
    "package.json"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
    fi
done

# Create a .env.example file
echo ""
echo "📝 Creating .env.example..."
cat > .env.example << 'EOF'
# Optional: DeepSeek API Key for enhanced AI responses
# Get your key from: https://platform.deepseek.com
# VITE_DEEPSEEK_API_KEY=sk-your-api-key-here

# The app works in demo mode without this key
EOF
echo "✅ Created .env.example"

echo ""
echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open your browser to:"
echo "   http://localhost:5173"
echo ""
echo "3. Connect your wallet (MetaMask)"
echo ""
echo "4. Get test ETH from faucets:"
echo "   - Sepolia: https://sepoliafaucet.com"
echo "   - Blast Sepolia: https://blastapi.io/faucets/blast-sepolia"
echo ""
echo "5. Explore the features!"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - README.md - Full documentation"
echo "   - QUICKSTART.md - 5-minute guide"
echo "   - SUBMISSION.md - Hackathon details"
echo ""
echo "💡 Optional: Add DeepSeek API key in Settings for enhanced AI"
echo ""
echo "Good luck with your hackathon! 🚀"
