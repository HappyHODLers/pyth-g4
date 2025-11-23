# Hackathon Submission Checklist

## 📋 Pre-Submission Checklist

Use this checklist to ensure your submission is complete and ready for the Pyth Network Hackathon.

### ✅ Technical Requirements

#### Price Feeds (Pull Oracle) - $10,000 Prize
- [ ] Application fetches price data from Hermes
- [ ] Application updates prices on-chain using `updatePriceFeeds`
- [ ] Application consumes/reads prices from the contract
- [ ] Complete workflow is demonstrated in the UI
- [ ] Code compiles without errors (`npm run build`)
- [ ] Follows Pyth EVM integration guide

#### Pyth Entropy - $5,000 + $5,000 Prizes
- [ ] Application requests random numbers on-chain
- [ ] Application retrieves and displays generated random numbers
- [ ] Code follows Entropy best practices
- [ ] Detailed README included
- [ ] Ready to submit PR to `pyth-network/pyth-examples`

### 📝 Documentation

- [ ] README.md is comprehensive and clear
- [ ] Installation instructions are included
- [ ] Usage guide with examples is provided
- [ ] Code is well-commented
- [ ] QUICKSTART.md for easy setup
- [ ] SUBMISSION.md with hackathon details

### 🧪 Testing

- [ ] Application runs locally (`npm run dev`)
- [ ] Production build works (`npm run build`)
- [ ] Wallet connection works (tested with MetaMask)
- [ ] Price feed fetch works (Hermes API)
- [ ] Price update transaction succeeds (on testnet)
- [ ] Price reading from contract works
- [ ] Entropy request transaction succeeds
- [ ] Random number retrieval works
- [ ] AI chatbot responds (demo mode at minimum)
- [ ] All UI components render correctly
- [ ] No console errors in browser

### 🎨 User Experience

- [ ] UI is polished and professional
- [ ] Navigation is intuitive
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Mobile responsive (if applicable)
- [ ] All interactive elements work

### 📹 Submission Materials

- [ ] Create video demo (2-5 minutes)
  - [ ] Show wallet connection
  - [ ] Demonstrate Price Feeds workflow
  - [ ] Demonstrate Entropy workflow
  - [ ] Show AI chatbot interaction
  
- [ ] Take screenshots
  - [ ] Dashboard with price feeds
  - [ ] Entropy random number generation
  - [ ] AI chatbot in action
  - [ ] Wallet connected state

- [ ] Update README with:
  - [ ] Your GitHub username
  - [ ] Your Twitter handle (if applicable)
  - [ ] Live demo link (if deployed)
  - [ ] Video demo link

### 🚀 Optional Enhancements

- [ ] Deploy to Vercel/Netlify
- [ ] Add custom domain
- [ ] Create Twitter thread about the project
- [ ] Write blog post about implementation
- [ ] Add more price feeds
- [ ] Implement additional features

### 📤 Submission Steps

#### For Pyth Price Feeds Prize:
1. [ ] Submit project to hackathon platform
2. [ ] Include all required links (GitHub, demo, video)
3. [ ] Tag Pyth Network in social posts

#### For Pyth Entropy Prize:
1. [ ] Fork `pyth-network/pyth-examples` repository
2. [ ] Create new folder in `entropy/` directory
3. [ ] Add your project code
4. [ ] Include comprehensive README
5. [ ] Submit Pull Request
6. [ ] Submit to hackathon platform

### ✅ Final Checks

- [ ] All code is committed to Git
- [ ] Repository is public on GitHub
- [ ] README has no placeholder text
- [ ] No sensitive keys in code
- [ ] `.env.example` provided (not `.env`)
- [ ] License file included (MIT)
- [ ] All links in documentation work
- [ ] Project name is clear and memorable

### 🎯 Quality Indicators

**Innovation** (30 points)
- [ ] Novel use case or combination of features
- [ ] Solves a real problem
- [ ] Demonstrates creativity

**Technical Implementation** (30 points)
- [ ] Clean, well-structured code
- [ ] Proper error handling
- [ ] Good TypeScript usage
- [ ] Follows best practices

**Documentation** (20 points)
- [ ] Clear and comprehensive
- [ ] Easy to understand and follow
- [ ] Well-commented code

**User Experience** (20 points)
- [ ] Intuitive interface
- [ ] Professional design
- [ ] Good performance

---

## 🎉 Ready to Submit?

Once all items are checked:

1. **Double-check** that your demo works end-to-end
2. **Review** all documentation for typos
3. **Test** the installation process on a fresh machine if possible
4. **Submit** with confidence!

**Good luck! 🚀**

---

## 📞 Need Help?

- Check the [Pyth Dev Forum](https://dev-forum.pyth.network/)
- Review [Pyth Documentation](https://docs.pyth.network/)
- Ask the AI chatbot in your application!
