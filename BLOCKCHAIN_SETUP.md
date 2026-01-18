# Event Horizon - Blockchain Setup Guide

This guide explains how to deploy and run the fully functional blockchain-based access control system.

## Architecture Overview

The Event Horizon system consists of:

1. **Smart Contract (Solidity)** - Immutable access control rules on Sepolia blockchain
2. **Frontend (Next.js)** - React app with MetaMask wallet integration
3. **Backend API** - Gemini AI for semantic content masking

## Prerequisites

- MetaMask browser extension installed and set up
- Node.js 18+ and npm installed
- A Sepolia testnet account with some SepoliaETH (get from faucet)
- Gemini API key (from ai.google.dev)

## Step 1: Get SepoliaETH Test Tokens

Visit one of these faucets:
- https://sepolia-faucet.pk910.de/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://leaderboard.arbitrum.io/faucets

Add your MetaMask address and receive test ETH.

## Step 2: Deploy the Smart Contract

### Option A: Using Hardhat (Recommended)

1. **Install Hardhat dependencies:**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers
npm install --save-dev @nomicfoundation/hardhat-etherscan
```

2. **Create hardhat.config.js:**
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
```

3. **Set environment variables in .env.local:**
```
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

⚠️ **WARNING:** Never commit .env.local with your private key to git!

4. **Deploy the contract:**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

This will output your contract address. Copy it for the next step.

### Option B: Using Remix IDE

1. Go to https://remix.ethereum.org
2. Create a new file: `AccessControl.sol`
3. Copy the contents from `/contracts/AccessControl.sol`
4. Compile (Ctrl + S)
5. Select "Injected Provider - MetaMask" as environment
6. Deploy with MetaMask
7. Copy the deployed contract address

## Step 3: Configure Environment Variables

Update `.env.local` with:

```
# Frontend (these will be public in browser)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<your_deployed_contract_address>
NEXT_PUBLIC_NETWORK_ID=11155111

# Backend API (kept secret on server)
GEMINI_API_KEY=<your_gemini_api_key>
```

**Note:** The RPC URL is handled automatically by MetaMask when users connect their wallets. We don't need to expose it in the frontend.

### Getting a Gemini API Key

1. Go to https://ai.google.dev/
2. Click "Get API key"
3. Create a new project
4. Copy the API key to your `.env.local`

## Step 4: Start the Application

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Step 5: Assign Roles (Optional)

If you want other addresses to test different roles:

1. Go to https://sepolia.etherscan.io
2. Paste your contract address in the search bar
3. Go to "Write Contract" tab
4. Click "Connect to Web3" and connect MetaMask
5. Find `assignRole` function
6. Enter: 
   - user address
   - role (0=FOUNDER, 1=ENGINEER, 2=MARKETING)
7. Click "Write" and approve the transaction

## How It Works

### Access Flow

1. **User connects wallet** → MetaMask switches to Sepolia network
2. **Frontend fetches user's role** → Calls smart contract's `getUserRole()`
3. **User views document** → Frontend calls `checkFieldAccess()` for each field
4. **Access rules applied:**
   - **FOUNDER** (Role 0): Full access to all fields
   - **ENGINEER** (Role 1): 
     - Revenue: Partial masking
     - Risks: Denied
     - Roadmap & Market Size: Full access
   - **MARKETING** (Role 2):
     - Revenue: Partial masking  
     - Risks: Semantic AI masking
     - Roadmap & Market Size: Full access

### Access Types

- **Full Access** - Complete visibility (Green indicator)
- **Partial Masking** - First and last characters visible (Yellow indicator)
- **Semantic Masking** - AI transforms sensitive info (Blue indicator with Sparkles)
- **Denied** - Complete access restriction (Red indicator)

### Verification on Blockchain

Each field access triggers:
1. Smart contract verification call
2. Event emission to blockchain
3. Transaction hash displayed in UI
4. Viewable on Sepolia Etherscan

## Smart Contract Details

### Contract Address Format
The contract uses:
- **State**: Mapping of user addresses to roles
- **Functions**: Read-only access check, role assignment
- **Events**: AccessVerified events logged on-chain

### Gas Optimization
- No state changes for read operations (free)
- Role assignment costs ~50k gas
- Events logged with minimal data

## Troubleshooting

### "Contract not initialized"
- Ensure `NEXT_PUBLIC_CONTRACT_ADDRESS` is set in .env.local
- Make sure you're connected to the correct Sepolia network
- Contract address must be valid (starts with 0x)

### "MetaMask wrong network"
- Click "Switch to Sepolia" button in top right
- Or manually add Sepolia to MetaMask:
  - Network: https://sepolia.infura.io/v3/YOUR_KEY
  - Chain ID: 11155111
  - Currency: ETH

### "No SepoliaETH"
- Get test tokens from the faucets listed in Step 1
- Allow 1-2 minutes for tokens to arrive

### "Gemini API not working"
- Check API key is set in .env.local
- Verify API is enabled at ai.google.dev
- Check browser console for error messages

## Testing Different Roles

To test as different roles:

1. **As FOUNDER**: Your deployer address automatically has FOUNDER role
2. **As ENGINEER**: 
   ```bash
   # Use second MetaMask account
   # Assign role from main account:
   # assignRole(0x<engineer_address>, 1)
   ```
3. **As MARKETING**:
   ```bash
   # Use third MetaMask account  
   # Assign role from main account:
   # assignRole(0x<marketing_address>, 2)
   ```

Then switch accounts in MetaMask to test different access levels.

## Production Deployment

For mainnet deployment:

1. Deploy contract to Ethereum mainnet (requires real ETH)
2. Update `NEXT_PUBLIC_NETWORK_ID=1`
3. Update RPC_URL to mainnet provider
4. Deploy frontend to Vercel
5. Update contract address in production environment variables

## Security Considerations

⚠️ **This is a demo system. For production:**

- Use upgradeable proxies for contract management
- Implement access control lists (ACL)
- Add emergency pause mechanisms
- Conduct security audit
- Use multi-sig wallets for admin functions
- Never commit private keys

## Support

For issues:
1. Check browser console (F12 → Console tab)
2. Review transaction status on Sepolia Etherscan
3. Verify MetaMask is set to Sepolia network
4. Ensure API keys are properly configured
