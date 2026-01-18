# Event Horizon - System Architecture

## High-Level Flow

```
User Opens App
    ↓
Connect MetaMask Wallet
    ↓
Auto-Switch to Sepolia Network
    ↓
Initialize ethers.js Provider & Signer
    ↓
Load Smart Contract Instance
    ↓
Fetch User Role from Contract
    ↓
For Each Document Field:
  ├─ Call contract: checkFieldAccess()
  ├─ Get AccessType (FULL, PARTIAL, SEMANTIC, DENIED)
  ├─ If SEMANTIC: Call Gemini API
  └─ Display Content Based on AccessType
```

## Component Hierarchy

```
RootLayout
├── MetaMaskProvider (Context)
│   └── Head (Metadata)
│
├── Page (/)
│   ├── Header
│   │   ├── Logo + Title
│   │   └── WalletHeader
│   │       ├── Connection Status
│   │       └── Network Indicator
│   │
│   ├── Status Banners
│   │   ├── Wallet Not Connected
│   │   ├── Contract Connected
│   │   ├── Contract Not Set
│   │   └── Wrong Network
│   │
│   └── Main Content (Grid)
│       ├── Sidebar
│       │   ├── RoleSwitcher
│       │   ├── Info Card
│       │   └── Access Legend
│       │
│       └── Content Area
│           ├── Hero Section
│           ├── Document Info Card
│           ├── Document Fields (Grid)
│           │   └── DocumentField × 4
│           │       ├── Field Name
│           │       ├── Sensitivity Badge
│           │       ├── Access Status
│           │       ├── Content Display
│           │       └── AI Masking Button
│           └── Footer Info

useMetaMask() Hook (Global State)
├── account
├── isConnected
├── chainId
├── isCorrectChain
├── contract (ContractInteraction)
├── provider (ethers.BrowserProvider)
├── signer (ethers.Signer)
└── Methods:
    ├── connect()
    ├── disconnect()
    └── switchChain()
```

## Data Flow Diagram

```
Browser Storage
    ↓
React State (useMetaMask Hook)
    ├─ account: string
    ├─ chainId: string
    ├─ contract: ContractInteraction
    ├─ provider: BrowserProvider
    └─ signer: Signer
    ↓
Components Access via Hook
    ├── WalletHeader
    ├── RoleSwitcher
    ├── DocumentField
    └── Page
    ↓
Contract Methods Called
    ├─ getUserRole(address)
    ├─ checkFieldAccess(address, fieldIndex)
    └─ verifyAndLogAccess(fieldIndex)
    ↓
Sepolia Blockchain
    ├─ State: mapping(address => Role)
    ├─ Returns: AccessType enum
    └─ Events: RoleAssigned, AccessVerified
```

## File Organization

```
event-horizon/
│
├── Public Web (Served to Browser)
│   ├── /app/
│   │   ├── layout.tsx              ← Root layout, metadata
│   │   ├── page.tsx                ← Main dashboard page
│   │   ├── providers.tsx           ← MetaMask provider context
│   │   ├── globals.css             ← Tailwind + animations
│   │   └── /api/
│   │       └── mask-content/
│   │           └── route.ts        ← Gemini AI endpoint
│   │
│   ├── /components/
│   │   ├── WalletHeader.tsx        ← Connection UI
│   │   ├── RoleSwitcher.tsx        ← Role selection
│   │   ├── DocumentField.tsx       ← Field display + access control
│   │   └── /ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       └── ...
│   │
│   └── /lib/
│       ├── utils.ts                ← Utility functions
│       └── cn.ts                   ← Tailwind class merger
│
├── Blockchain Layer
│   ├── /contracts/
│   │   └── AccessControl.sol       ← Smart contract (Solidity)
│   │
│   ├── /lib/
│   │   ├── contractInteraction.ts  ← ethers.js wrapper
│   │   └── smartContract.ts        ← Contract logic + fallbacks
│   │
│   └── /scripts/
│       └── deploy.js               ← Deployment script
│
├── Testing
│   ├── /test/
│   │   └── AccessControl.test.js   ← 36 test cases
│   │
│   ├── hardhat.config.js           ← Hardhat config
│   └── .env.local                  ← Secrets (not in repo)
│
├── Configuration
│   ├── package.json                ← Dependencies
│   ├── tsconfig.json               ← TypeScript config
│   ├── next.config.mjs             ← Next.js config
│   └── tailwind.config.js          ← Tailwind config
│
└── Documentation
    ├── README.md                   ← Full documentation
    ├── DEPLOYMENT.md               ← Deployment guide
    ├── BLOCKCHAIN_SETUP.md         ← Setup instructions
    ├── DEMO.md                     ← Demo walkthrough
    ├── IMPLEMENTATION_SUMMARY.md   ← Technical overview
    ├── CHANGES.md                  ← What changed from mock
    ├── ARCHITECTURE.md             ← This file
    ├── QUICK_SETUP.txt             ← 5-minute setup
    └── .gitignore                  ← Excludes .env.local
```

## Contract Architecture

```
EventHorizonAccessControl.sol
│
├── State Variables
│   ├── mapping(address => Role) userRoles
│   ├── address public owner
│   └── enum Role { FOUNDER, ENGINEER, MARKETING }
│
├── Enums
│   ├── enum Role { FOUNDER=0, ENGINEER=1, MARKETING=2 }
│   └── enum AccessType { FULL=0, PARTIAL=1, SEMANTIC=2, DENIED=3 }
│
├── Events
│   ├── RoleAssigned(address indexed user, Role role)
│   └── AccessVerified(address indexed user, string field, AccessType accessType)
│
├── Modifiers
│   └── onlyOwner() - restricts to contract owner
│
└── Functions
    ├── [PUBLIC] assignRole(address user, Role role)
    │   ├─ Only: Owner
    │   ├─ Side Effects: Updates userRoles mapping, emits RoleAssigned
    │   └─ Gas: ~50,000
    │
    ├── [VIEW] getUserRole(address user) → Role
    │   ├─ Only: Anyone
    │   ├─ Gas: Free (read-only)
    │   └─ Returns: User's role (0, 1, or 2)
    │
    ├── [VIEW] checkFieldAccess(address user, uint8 fieldIndex) → AccessType
    │   ├─ Only: Anyone
    │   ├─ Gas: Free (read-only)
    │   ├─ Logic:
    │   │   ├─ If role == FOUNDER: return FULL for all fields
    │   │   ├─ If role == ENGINEER:
    │   │   │   ├─ revenue (0): PARTIAL
    │   │   │   ├─ risks (1): DENIED
    │   │   │   ├─ roadmap (2): FULL
    │   │   │   └─ marketSize (3): FULL
    │   │   ├─ If role == MARKETING:
    │   │   │   ├─ revenue (0): PARTIAL
    │   │   │   ├─ risks (1): SEMANTIC
    │   │   │   ├─ roadmap (2): FULL
    │   │   │   └─ marketSize (3): FULL
    │   │   └─ Else: DENIED
    │   └─ Returns: AccessType enum (0-3)
    │
    └── [PUBLIC] verifyAndLogAccess(uint8 fieldIndex)
        ├─ Only: Anyone (must be connected)
        ├─ Side Effects: Emits AccessVerified event
        ├─ Gas: ~25,000
        ├─ Validation:
        │   └─ fieldIndex must be 0-3
        ├─ Logic:
        │   ├─ Get field name from index
        │   ├─ Get user's access type
        │   └─ Emit event with details
        └─ Returns: void
```

## Request/Response Flow

### User Connects Wallet

```
User: Click "Connect Wallet"
  ↓
App: window.ethereum.request({method: 'eth_requestAccounts'})
  ↓
MetaMask: Shows connection dialog
  ↓
User: Approves connection
  ↓
MetaMask: Returns [userAddress]
  ↓
App: Stores address in state
  ↓
App: window.ethereum.request({method: 'eth_chainId'})
  ↓
MetaMask: Returns '0xaa36a7' (11155111 in decimal)
  ↓
App: Checks if === '0xaa36a7'
  ↓
If not Sepolia:
  ├─ Show "Switch to Sepolia" button
  └─ User clicks → App calls wallet_switchEthereumChain
Else:
  ├─ Initialize ethers.BrowserProvider
  ├─ Get signer: provider.getSigner()
  ├─ Create contract: new ethers.Contract(address, ABI, signer)
  └─ Update state → UI refreshes
```

### User Views Document Field

```
Component: DocumentField renders
  ↓
Effect: useEffect(() => {...}, [role, account, contract])
  ↓
App: Calls verifyBlockchainAccess(contract, account, fieldName)
  ↓
Function: getFieldIndex(fieldName) → returns 0-3
  ↓
Contract Call: contract.checkFieldAccess(account, fieldIndex)
  ↓
Blockchain: Runs checkFieldAccess() function
  ↓
Smart Contract Logic:
  ├─ Get userRoles[account]
  ├─ Match role to fieldIndex
  └─ Return AccessType (0, 1, 2, or 3)
  ↓
App: Receives AccessType
  ↓
Component: Updates state based on AccessType
  ├─ FULL (0): Show raw content
  ├─ PARTIAL (1): Show masked version ($5X,XXX,XXX)
  ├─ SEMANTIC (2): Call Gemini API
  └─ DENIED (3): Show "Access Denied"
  ↓
UI: Renders appropriate content with badge
```

### AI Content Masking

```
User: Clicks "View AI-Masked Content"
  ↓
App: fetch('/api/mask-content', {
        method: 'POST',
        body: { content: fieldValue, role }
      })
  ↓
API Route: /app/api/mask-content/route.ts
  ├─ Gets GEMINI_API_KEY from environment
  ├─ Creates Gemini client
  ├─ Calls generateText() with prompt:
  │    "Transform this sensitive text for marketing audience:
  │     Original: {content}
  │     Make it truthful but less threatening..."
  └─ Returns transformed text
  ↓
App: Receives transformed content
  ↓
State: Updates semanticContent
  ↓
UI: Shows AI-transformed version with "✨ AI-generated" label
```

## Security Layers

```
Browser Level
├─ MetaMask acts as gatekeeper
├─ User must approve all transactions
└─ Private key never leaves MetaMask

Contract Level
├─ Access rules immutable after deployment
├─ Role changes only via contract owner
├─ onlyOwner modifier on sensitive functions
└─ Event logging for audit trails

Environment Level
├─ Private key in .env.local (not in repo)
├─ API keys in environment variables
├─ No sensitive data in source code
└─ .gitignore prevents secrets leaking

Application Level
├─ TypeScript for type safety
├─ Try-catch for error handling
├─ Input validation
└─ Proper error messages
```

## Deployment Architecture

### Development (Local)

```
localhost:3000
    ↓
Hardhat Node (Optional)
    ↓
Contract Instance: In-memory
```

### Testing

```
Test Suite (36 tests)
    ↓
Hardhat Test Environment
    ↓
Contract Deployment: In-memory
    ↓
Access Verification: Via contract calls
```

### Production (Sepolia Testnet)

```
Frontend: Deployed to Vercel
    ↓
ethers.js → Sepolia RPC
    ↓
MetaMask → Sepolia Network
    ↓
Smart Contract: 0x...
    ├─ Stored on blockchain
    ├─ Immutable code
    └─ Viewable on Etherscan
```

## Technology Stack Layers

```
┌─────────────────────────────────────┐
│  User Interface Layer               │
│  ├─ React 19.2 Components          │
│  ├─ Next.js 16 App Router          │
│  └─ Tailwind CSS v4 Styling        │
└────────────┬────────────────────────┘
             │
┌────────────┴────────────────────────┐
│  Application Logic Layer             │
│  ├─ State Management (React hooks)  │
│  ├─ MetaMask Provider Context       │
│  └─ Access Control Logic            │
└────────────┬────────────────────────┘
             │
┌────────────┴────────────────────────┐
│  Web3 Integration Layer              │
│  ├─ ethers.js v6                    │
│  ├─ Contract Interaction            │
│  └─ Signer Management               │
└────────────┬────────────────────────┘
             │
┌────────────┴────────────────────────┐
│  Blockchain Layer                    │
│  ├─ Sepolia Network (EVM-compatible)|
│  ├─ Smart Contract (Solidity)       │
│  └─ On-Chain Storage                │
└────────────┬────────────────────────┘
             │
┌────────────┴────────────────────────┐
│  External Services                   │
│  ├─ Gemini AI (Semantic Masking)    │
│  ├─ Etherscan (Verification)        │
│  └─ MetaMask (Wallet)               │
└──────────────────────────────────────┘
```

## Performance Optimization

```
Rendering Optimization
├─ Component memoization
├─ useEffect dependency arrays
├─ Lazy field loading
└─ Debounced state updates

Network Optimization
├─ Batch contract calls where possible
├─ Cache user roles
├─ Minimize Gemini API calls
└─ Reuse provider instance

Gas Optimization
├─ Read operations are free
├─ Batch writes
├─ Optimize event emission
└─ Use view functions for queries
```

## Error Handling Flow

```
User Action
    ↓
Try Execute
    ├─ Success? → Update state → Render
    └─ Error? → Catch block
        ↓
    Categorize Error
        ├─ Network error? → Show "Check connection"
        ├─ Contract error? → Show "Contract error"
        ├─ User rejected? → Show "Transaction rejected"
        └─ Other? → Show "Unknown error"
        ↓
    Log to console
        ↓
    Show user-friendly message
        ↓
    Suggest next step
```

---

This architecture ensures:
- ✅ Real blockchain integration
- ✅ Type-safe code
- ✅ Modular components
- ✅ Proper error handling
- ✅ Scalable design
- ✅ Production-ready
