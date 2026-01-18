# Quick Start Deployment

## 1. Install Dependencies

```bash
npm install
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-etherscan dotenv ethers
```

## 2. Set Up Environment Variables

Create `.env.local`:

```
# Smart Contract Deployment (keep secret!)
PRIVATE_KEY=<your_wallet_private_key>
ETHERSCAN_API_KEY=<your_etherscan_api_key>

# Frontend (safe to expose)
GEMINI_API_KEY=<your_gemini_api_key>
```

⚠️ **IMPORTANT:** Get your private key from MetaMask:
1. Click account icon → Settings → Security & Privacy
2. Show Private Key → Enter password
3. Copy the private key (starts with 0x)
4. Add to .env.local

⚠️ **NEVER commit .env.local to git!**

## 3. Get SepoliaETH

Visit: https://sepolia-faucet.pk910.de/ or https://www.alchemy.com/faucets/ethereum-sepolia

Paste your wallet address to receive test ETH.

## 4. Deploy Smart Contract

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Output will show:**
```
✓ EventHorizonAccessControl deployed to: 0x...
```

Copy this address.

## 5. Update .env.local

Add to `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<copied_address>
NEXT_PUBLIC_NETWORK_ID=11155111
```

## 6. Get Gemini API Key

1. Go to https://ai.google.dev/
2. Click "Get API key"
3. Create new project or select existing
4. Copy API key to .env.local:
```
GEMINI_API_KEY=<your_gemini_api_key>
```

## 7. Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

## 8. Test It!

1. **Click "Connect Wallet"** - MetaMask opens
2. **Approve network switch** to Sepolia
3. **Approve connection** in MetaMask
4. **View the Master Strategy Document** - as Founder, you see everything
5. **Switch roles** using the selector on the left
6. **Watch content change** based on blockchain rules:
   - **Founder**: Full access to all fields
   - **Engineer**: Revenue masked, Risks blocked
   - **Marketing**: Revenue masked, Risks AI-masked
7. **Click "View AI-Masked Content"** on Risks to see semantic transformation

## Testing Different Roles Locally

Want to test Engineer and Marketing roles? Use MetaMask's account switching:

### Test as Engineer:
```bash
# In MetaMask, create a new account or import one you control
# From your main account (Founder), assign it the Engineer role:

# Go to Sepolia Etherscan (https://sepolia.etherscan.io)
# Search your contract address
# Click "Write as Proxy" → Connect MetaMask
# Find assignRole function
# Enter:
#   user = 0x<engineer_address>
#   role = 1
# Click Write

# Now switch to that account in MetaMask to see Engineer view
```

### Test as Marketing:
```bash
# Same process but:
#   role = 2
# Switch to that account to see Marketing view
```

## Verify on Etherscan

1. Go to https://sepolia.etherscan.io
2. Paste your contract address
3. View:
   - Contract code
   - Transaction history
   - Access verification events

## Troubleshooting

**Error: "Invalid private key"**
- Make sure PRIVATE_KEY in .env.local is correct format (starts with 0x)
- Don't include quotes around the key

**Error: "Failed to connect to Sepolia"**
- Check internet connection
- Verify RPC_URL in .env.local is correct
- Try a different RPC provider if infura is down

**Error: "Insufficient funds for gas"**
- Get more SepoliaETH from faucet
- Wait for previous transactions to confirm (1-2 min)

**MetaMask shows "Wrong Network"**
- Click the network selector in MetaMask
- Choose Sepolia (or add it if not listed)
- Refresh the page

**Gemini API not working**
- Verify API key is set and correct
- Check at https://ai.google.dev/settings that API is enabled
- Open browser console (F12) for error details

## What's Happening Behind the Scenes

1. **MetaMask connects** → Requests account signature
2. **App initializes** → Reads your role from smart contract
3. **Frontend calls contract** → `checkFieldAccess(yourAddress, fieldIndex)` for each field
4. **Contract returns** → AccessType enum (FULL, PARTIAL, SEMANTIC, or DENIED)
5. **Frontend renders** → Shows, masks, or hides content based on access type
6. **On interaction** → Contract emits event on blockchain, creates transaction hash
7. **Gemini transforms** → AI rewrites sensitive content for Marketing role

## Contract Functions Reference

### Read Functions (Free - no gas)
```solidity
getUserRole(address) → uint8
  Returns user's role (0=FOUNDER, 1=ENGINEER, 2=MARKETING)

checkFieldAccess(address user, uint8 fieldIndex) → uint8
  Returns access type:
    0 = FULL
    1 = PARTIAL  
    2 = SEMANTIC
    3 = DENIED
```

### Write Functions (Costs gas)
```solidity
assignRole(address user, uint8 role)
  Set a user's role (only owner can call)

verifyAndLogAccess(uint8 fieldIndex)
  Emit access verification event
```

## Next Steps

- Try modifying the contract's access rules in `/contracts/AccessControl.sol`
- Deploy a new version with different rules
- Test different Gemini prompts in `/app/api/mask-content/route.ts`
- Deploy frontend to Vercel for public access

---

**Questions?** Check the full guide in `BLOCKCHAIN_SETUP.md`
