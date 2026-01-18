# Event Horizon - Blockchain Access Control System

A fully functional blockchain-based document access control system that demonstrates real Web3 integration, MetaMask wallet authentication, and Solidity smart contracts.

## Features

✨ **Real Blockchain Integration**
- Solidity smart contracts deployed on Sepolia testnet
- On-chain verification of user roles and permissions
- Transaction hashes logged for all access events
- Viewable on Etherscan for transparency

🔐 **MetaMask Wallet Integration**
- Connect directly from the app
- Automatic network switching to Sepolia
- Real wallet-based authentication
- Account switching for role testing

🎯 **Role-Based Access Control**
- **Founder**: Full access to all sensitive data
- **Engineer**: Partial masking of financials, no access to risks
- **Marketing**: AI-powered semantic content transformation

🤖 **Gemini AI Integration**
- Semantic masking transforms sensitive information
- "Lawsuit Pending" becomes "External corporate dependency pending resolution"
- Preserves meaning while protecting sensitive data

🎨 **Beautiful UI**
- Fluid animations and transitions
- Real-time blockchain status indicators
- Contract address display with Etherscan links
- Responsive design for all devices

## Architecture

```
┌─────────────────────────────────────────────────┐
│         User's Browser (MetaMask)               │
│  ┌───────────────────────────────────────────┐  │
│  │  React Frontend (Next.js)                 │  │
│  │  - Document viewing                       │  │
│  │  - Role switching                         │  │
│  │  - Real-time access verification          │  │
│  └───────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────┘
               │ ethers.js + MetaMask
               ▼
┌─────────────────────────────────────────────────┐
│    Sepolia Blockchain (Ethereum Testnet)       │
│  ┌───────────────────────────────────────────┐  │
│  │  Smart Contract: AccessControl.sol        │  │
│  │  - User role tracking                     │  │
│  │  - Immutable access rules                 │  │
│  │  - Event logging                          │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│    Backend API (Next.js Route Handlers)         │
│  ┌───────────────────────────────────────────┐  │
│  │  /api/mask-content → Gemini AI            │  │
│  │  Semantic content transformation          │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Quick Start

### 1. Clone and Install
```bash
git clone <repo>
cd event-horizon
npm install
```

### 2. Get Test ETH
Visit https://sepolia-faucet.pk910.de/ and request SepoliaETH (free test tokens)

### 3. Deploy Smart Contract
```bash
# Set up .env.local with your private key
echo "PRIVATE_KEY=0x..." > .env.local

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Configure Environment
Update `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<deployed_contract_address>
NEXT_PUBLIC_NETWORK_ID=11155111
GEMINI_API_KEY=<your_gemini_api_key>
```

### 5. Run the App
```bash
npm run dev
```

Visit http://localhost:3000

**For detailed setup instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

## How It Works

### Step 1: User Connects Wallet
```typescript
// User clicks "Connect Wallet"
// MetaMask opens, they sign a transaction
// App receives their wallet address
```

### Step 2: Role Verification
```solidity
// Frontend calls: contract.getUserRole(userAddress)
// Smart contract returns role:
//   0 = FOUNDER
//   1 = ENGINEER  
//   2 = MARKETING
```

### Step 3: Access Control
```solidity
// For each document field:
// contract.checkFieldAccess(userAddress, fieldIndex)
// Returns AccessType:
//   FULL = 0     // Show everything
//   PARTIAL = 1  // Show masked version
//   SEMANTIC = 2 // Show AI-transformed version
//   DENIED = 3   // Show nothing
```

### Step 4: Content Rendering
- **Full Access** → Display raw content
- **Partial Masking** → Show masked version (e.g., "$5X,XXX,XXX")
- **Semantic Masking** → Call Gemini API to transform content
- **Denied** → Show "Access Denied" with lock icon

## Test Scenarios

### Scenario 1: View as Founder (Full Access)
1. Connect your wallet (deployer has FOUNDER role)
2. See all data: Revenue, Risks, Roadmap, Market Size
3. All fields show green "Full Access" indicator

### Scenario 2: View as Engineer (Limited Access)
1. Create/import another MetaMask account
2. From founder account, assign ENGINEER role (see DEPLOYMENT.md)
3. Switch to engineer account in MetaMask
4. Refresh page
5. Observe:
   - Revenue: `$5X,XXX,XXX` (masked)
   - Risks: **BLOCKED** (red indicator)
   - Roadmap: Full access
   - Market Size: Full access

### Scenario 3: View as Marketing (AI Masking)
1. Create/import third MetaMask account
2. From founder account, assign MARKETING role
3. Switch to marketing account
4. Observe:
   - Revenue: `$5X,XXX,XXX` (masked)
   - Risks: Shows AI-transformed content
     - Original: "Lawsuit Pending"
     - AI version: "External corporate dependency pending resolution"
   - Roadmap: Full access
   - Market Size: Full access

## Contract Details

### EventHorizonAccessControl.sol

**State Variables:**
```solidity
mapping(address => Role) public userRoles;
address public owner;
```

**Key Functions:**
```solidity
// Get user's role
function getUserRole(address user) external view returns (Role)

// Check access for a field
function checkFieldAccess(address user, uint8 fieldIndex) external view returns (AccessType)

// Assign role (owner only)
function assignRole(address user, Role role) external onlyOwner

// Verify and log access (emits event)
function verifyAndLogAccess(uint8 fieldIndex) external
```

**Events:**
```solidity
event RoleAssigned(address indexed user, Role role);
event AccessVerified(address indexed user, string field, AccessType accessType);
```

### Frontend Integration

**Smart Contract Interaction:**
```typescript
// /lib/contractInteraction.ts
export class ContractInteraction {
  async getUserRole(address: string): Promise<Role>
  async checkFieldAccess(userAddress: string, fieldIndex: number): Promise<AccessType>
  async verifyAndLogAccess(fieldIndex: number): Promise<TransactionReceipt>
}
```

**MetaMask Provider:**
```typescript
// /app/providers.tsx
export const MetaMaskProvider // Handles wallet connection and contract initialization
export const useMetaMask() // Hook for accessing wallet data and methods
```

## File Structure

```
event-horizon/
├── /contracts/
│   └── AccessControl.sol           # Solidity smart contract
├── /app/
│   ├── page.tsx                    # Main page with document view
│   ├── providers.tsx               # MetaMask + Web3 context
│   ├── layout.tsx                  # App layout with metadata
│   ├── globals.css                 # Tailwind + animations
│   └── /api/
│       └── mask-content/route.ts   # Gemini AI API
├── /lib/
│   ├── smartContract.ts            # Contract interaction logic
│   └── contractInteraction.ts      # ethers.js wrapper
├── /components/
│   ├── WalletHeader.tsx            # Connection status + chain switcher
│   ├── RoleSwitcher.tsx            # Role selection dropdown
│   └── DocumentField.tsx           # Document field with access control
├── /scripts/
│   └── deploy.js                   # Contract deployment script
├── hardhat.config.js               # Hardhat configuration
├── DEPLOYMENT.md                   # Quick start guide
└── BLOCKCHAIN_SETUP.md             # Comprehensive setup guide
```

## Environment Variables

### For Deployment (Local Only)
```
PRIVATE_KEY=0x...                           # Your wallet private key for deployment
ETHERSCAN_API_KEY=...                       # For contract verification (optional)
```

### For Frontend (Safe to Expose)
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...         # Deployed contract address
NEXT_PUBLIC_NETWORK_ID=11155111             # Sepolia network ID
```

### For Backend API (Kept Secret)
```
GEMINI_API_KEY=...                          # Google Gemini API key
```

**Note:** The RPC endpoint is handled by MetaMask automatically when users connect their wallets.

## Blockchain Details

**Network:** Sepolia Testnet
- Chain ID: `11155111`
- RPC: `https://sepolia.infura.io/v3/...`
- Block Explorer: `https://sepolia.etherscan.io`
- Currency: SepoliaETH (free from faucets)

**Gas Costs (Approximate):**
- Deploy contract: ~150,000 gas
- Assign role: ~50,000 gas
- Check access: ~3,000 gas (read-only, free)
- Log access: ~25,000 gas

## AI Integration

**Gemini API Endpoint:** `/api/mask-content`

Transforms sensitive content for Marketing role:

```typescript
// Input
{
  content: "Lawsuit Pending",
  role: "marketing"
}

// Output (via Gemini)
{
  masked: "External corporate dependency pending resolution"
}
```

The prompt ensures:
- Same meaning preserved
- Less specific and threatening
- Still truthful and accurate
- Professional tone maintained

## Security Considerations

⚠️ **This is a demonstration system. For production:**

1. **Use Upgradeable Contracts**: Enable future updates without redeployment
2. **Multi-Sig Wallets**: Use multiple signers for admin functions
3. **Access Control Lists (ACL)**: Implement granular permission system
4. **Emergency Pause**: Add circuit breaker for critical functions
5. **Audit**: Professional security audit before mainnet deployment
6. **Private Keys**: Never commit to version control, use secure management

## API Reference

### Smart Contract Methods

#### `getUserRole(address user) → Role`
Returns the role of a user (0=FOUNDER, 1=ENGINEER, 2=MARKETING)

#### `checkFieldAccess(address user, uint8 fieldIndex) → AccessType`
Returns access type for a field:
- `0` = FULL - Complete visibility
- `1` = PARTIAL - Masked display
- `2` = SEMANTIC - AI-transformed display
- `3` = DENIED - Access blocked

#### `assignRole(address user, Role role)`
Assign a role to a user (only owner)

#### `verifyAndLogAccess(uint8 fieldIndex)`
Emit access verification event to blockchain

### Frontend Hooks

#### `useMetaMask()`
```typescript
const {
  account,                    // User's wallet address
  isConnected,               // Connection status
  chainId,                   // Current chain ID
  isCorrectChain,            // Is Sepolia?
  contract,                  // ContractInteraction instance
  connect,                   // Connect wallet
  disconnect,                // Disconnect wallet
  switchChain,               // Switch to Sepolia
} = useMetaMask()
```

## Troubleshooting

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting guide.

Common issues:
- **"Contract not initialized"** → Check NEXT_PUBLIC_CONTRACT_ADDRESS is set
- **"Wrong network"** → Click "Switch to Sepolia" button
- **"No SepoliaETH"** → Get free test tokens from faucet
- **"Gemini API error"** → Verify API key is correct and enabled

## Performance

- Initial page load: ~2-3 seconds
- Wallet connection: ~3-5 seconds
- Access verification: ~600ms (blockchain check)
- AI content masking: ~1-2 seconds (API call)
- Field rendering: <100ms

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires MetaMask extension

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy contract to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## License

MIT

## Support

For issues and questions:
1. Check the [troubleshooting section](./DEPLOYMENT.md#troubleshooting)
2. Review contract events on [Sepolia Etherscan](https://sepolia.etherscan.io)
3. Check browser console for detailed error messages (F12)

---

**Built with Next.js, Solidity, ethers.js, and Tailwind CSS**
