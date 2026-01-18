# Event Horizon - Live Demo Guide

## What You'll See

A beautiful blockchain-powered document access control system where sensitive information is protected by Solidity smart contracts on Sepolia testnet. Different roles see different data based on immutable blockchain rules.

## Before You Start

✅ Have MetaMask installed and set up
✅ Have at least 0.1 SepoliaETH in your wallet (get free from faucet)
✅ Have the app running (`npm run dev`)

## Live Demo Walk-Through

### Phase 1: Initial Setup (2-3 minutes)

1. **Visit http://localhost:3000**
   - See the Event Horizon dashboard
   - Notice the connection warning banner

2. **Click "Connect Wallet"**
   - MetaMask popup opens
   - Review and approve the connection request
   - Your account address appears in the top right

3. **Automatic Network Switch**
   - MetaMask asks to switch to Sepolia network
   - Click "Approve" to confirm
   - Notice the banner changes: "Smart Contract Connected"

### Phase 2: Founder View - Full Access (1 minute)

You're automatically the FOUNDER (deployer of the contract).

**See:**
- Left panel shows "FOUNDER" as current role (highlighted in blue)
- All 4 fields visible with full data:
  - Revenue: `$5.2M` (green indicator - Full Access)
  - Risks: `Lawsuit Pending` (green indicator - Full Access)
  - Roadmap: `Launching V2 with AI capabilities...` (green indicator)
  - Market Size: `$2.8B TAM` (green indicator)

**Explain:**
> "As the founder, I have unrestricted access to all sensitive data. The blockchain confirms my role and grants full visibility."

### Phase 3: Switch to Engineer Role (2 minutes)

#### Via Smart Contract (Real Demo)
If you deployed the contract and assigned yourself the engineer role:

1. **Get your wallet address**: Copy from MetaMask
2. **Go to Sepolia Etherscan**: https://sepolia.etherscan.io
3. **Search your contract address**
4. **Click "Write as Proxy"** → Connect MetaMask
5. **Find `assignRole` function**:
   - user: `0x<your_address>`
   - role: `1` (for ENGINEER)
6. **Click Write** → Approve transaction
7. **Refresh the app**

#### Or Via Role Switcher (Local Fallback)
If you don't want to deploy the contract yet:

1. Click the "Switch Role" dropdown on the left
2. Select "ENGINEER"
3. Watch the document fields update

**What Changes:**
- Revenue: `$5X,XXX,XXX` (yellow indicator - Partially Masked)
- Risks: **BLOCKED** with 🔒 icon (red indicator - Access Denied)
- Roadmap: Still visible
- Market Size: Still visible

**Explain:**
> "Engineers don't need financial details, and we protect sensitive legal risks. The smart contract enforces these rules immutably."

### Phase 4: Switch to Marketing Role (3 minutes)

1. **From founder account**:
   - Go to Etherscan
   - Find your contract
   - Assign MARKETING role (role = 2)

2. **Or use local switcher**:
   - Click "Switch Role" → "MARKETING"

**What Changes:**
- Revenue: `$5X,XXX,XXX` (yellow - Partially Masked)
- Risks: **Shows new AI text** ✨
  - Original: "Lawsuit Pending"
  - AI version: "External corporate dependency pending resolution"
  - (Blue indicator - Semantically Masked)
- Roadmap: Still visible
- Market Size: Still visible

3. **Click "View AI-Masked Content"** on the Risks field:
   - Shows the transformed text
   - Displays "✨ AI-generated semantic alternative"
   - Explains how sensitive data was preserved but made safe

**Explain:**
> "Marketing needs to know about the situation but not the scary details. Gemini AI transforms the content—it's truthful but less threatening. Same meaning, different presentation."

### Phase 5: Show Blockchain Verification (2 minutes)

**Point out the UI elements:**

1. **Top Right - Chain Status**:
   - Shows connected wallet address
   - Shows "Sepolia" network indicator
   - Confirms correct blockchain

2. **Info Card (Left Sidebar)**:
   - "Smart Contract Connected"
   - Shows: "Access rules verified on-chain via Solidity contract"
   - Displays contract address with link to Etherscan

3. **Each Document Field**:
   - Shows access type badge
   - Displays "Blockchain rule:" explanation
   - May show transaction hash if available

4. **Verify on Etherscan**:
   - Open browser tab to Sepolia Etherscan
   - Search your contract address
   - Show contract code (it's there!)
   - Show events logged from access verifications

**Explain:**
> "Every access decision is verified against the blockchain. You can see the contract code in Etherscan - it's permanent, immutable, and transparent. The rules can't be cheated or bypassed."

## Key Demo Points to Highlight

### 1. Real Web3 Integration
```
✓ MetaMask wallet connection (not mocked)
✓ Real Sepolia blockchain network
✓ Actual Solidity smart contract
✓ ethers.js for contract interaction
✓ Transaction hashes on Etherscan
```

### 2. Access Control
```
Founder          Engineer        Marketing
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Revenue  │    │ Revenue  │    │ Revenue  │
│ $5.2M    │    │ $5X,XXX  │    │ $5X,XXX  │
└──────────┘    └──────────┘    └──────────┘

│ Risks    │    │ Risks    │    │ Risks    │
│ Lawsuit  │    │ BLOCKED  │    │ AI Text  │
│ Pending  │    │          │    │ (Safe)   │
└──────────┘    └──────────┘    └──────────┘
```

### 3. AI Transformation
```
Original Text:          AI-Transformed Text:
"Lawsuit Pending"  →    "External corporate dependency
                         pending resolution"
                         
[Truthful]              [Truthful + Safe]
[Specific]              [General]
[Threatening]           [Professional]
```

### 4. Immutability
```
Smart Contract on Sepolia
↓
Cannot be changed
↓
Cannot be bypassed
↓
Transparent & auditable
```

## Talking Points

**On Security:**
> "Instead of trusting passwords or role management systems, we trust the blockchain. The contract rules are permanent and can't be secretly modified."

**On User Experience:**
> "Users connect with MetaMask—no creating accounts, no passwords. The blockchain knows your role immediately."

**On Sensitive Data:**
> "We use multiple strategies: blocking (Engineer can't see risks), masking (both see partial revenue), and AI transformation (Marketing sees context without specifics)."

**On Transparency:**
> "Every access attempt is logged on the blockchain. Audit trails are transparent and permanent."

**On Flexibility:**
> "To change access rules, we deploy a new contract. Old contract can be archived, new one enforces new rules."

## Common Questions & Answers

**Q: "Why use blockchain instead of a database?"**
A: Blockchain provides immutability and transparency. Rules can't be secretly changed. Anyone can audit the contract on Etherscan.

**Q: "Doesn't this cost a lot in gas fees?"**
A: On testnets (Sepolia), gas is free. On mainnet, read operations are free, write operations cost ~1-5 USD each.

**Q: "Can users cheat this system?"**
A: No. The blockchain enforces rules at the protocol level. Users can't modify their role unless the contract owner changes it.

**Q: "What if I want to deploy this to production?"**
A: Deploy to Ethereum mainnet instead of Sepolia. Gas costs real money, but the system works the same way.

**Q: "Can I see the actual code?"**
A: Yes! Go to Etherscan, search your contract, and view the verified source code.

## Troubleshooting During Demo

**Issue: "User can't connect MetaMask"**
- Check MetaMask is installed
- Check they're not already connected to app
- Have them disconnect and try again

**Issue: "Contract shows 'not initialized'"**
- Check NEXT_PUBLIC_CONTRACT_ADDRESS is set in .env.local
- Make sure you deployed the contract
- Have them refresh the page

**Issue: "Role assignment not working"**
- Use the local role switcher instead (dropdown on left)
- Or check that you assigned the role to that address

**Issue: "AI masking not showing"**
- Check GEMINI_API_KEY is set in .env.local
- Check browser console (F12) for errors
- Try clicking "View AI-Masked Content" again

**Issue: "Etherscan shows contract not verified"**
- That's fine for demo! The code is there, just not formally verified
- To verify: `npx hardhat verify --network sepolia <ADDRESS>`

## Demo Time Budget

- **Total**: 15-20 minutes
- Phase 1 (Setup): 2-3 min
- Phase 2 (Founder): 1 min
- Phase 3 (Engineer): 2 min
- Phase 4 (Marketing): 3 min
- Phase 5 (Blockchain): 2 min
- Q&A: 5 min

## Expected Reactions

✨ "Wow, it really is reading from the blockchain!"
✨ "The AI is actually rewriting the text!"
✨ "I can see the contract on Etherscan!"
✨ "This is actually decentralized!"

---

**Pro Tip:** Have Etherscan and the app open side-by-side. When you change roles, show the contract being called on Etherscan in real-time (might take 15-30 seconds to appear in explorer).

**Pro Tip 2:** Keep the browser console open (F12) to show the contract interaction logs.

Enjoy the demo!
