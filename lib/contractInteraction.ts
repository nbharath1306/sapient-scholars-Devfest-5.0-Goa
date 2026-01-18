import { ethers } from 'ethers'

// ABI for EventHorizonAccessControl contract
export const CONTRACT_ABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'owner',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'userRoles',
    type: 'function',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    name: 'assignRole',
    type: 'function',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'role', type: 'uint8' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'getUserRole',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    name: 'checkFieldAccess',
    type: 'function',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'fieldIndex', type: 'uint8' },
    ],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    name: 'verifyAndLogAccess',
    type: 'function',
    inputs: [{ name: 'fieldIndex', type: 'uint8' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'RoleAssigned',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'role', type: 'uint8', indexed: false },
    ],
  },
  {
    name: 'AccessVerified',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'field', type: 'string', indexed: false },
      { name: 'accessType', type: 'uint8', indexed: false },
    ],
  },
] as const

export enum Role {
  FOUNDER = 0,
  ENGINEER = 1,
  MARKETING = 2,
}

export enum AccessType {
  FULL = 0,
  PARTIAL = 1,
  SEMANTIC = 2,
  DENIED = 3,
}

export const RoleNames: Record<Role, string> = {
  [Role.FOUNDER]: 'founder',
  [Role.ENGINEER]: 'engineer',
  [Role.MARKETING]: 'marketing',
}

export const AccessTypeNames: Record<AccessType, string> = {
  [AccessType.FULL]: 'full',
  [AccessType.PARTIAL]: 'partial',
  [AccessType.SEMANTIC]: 'semantic',
  [AccessType.DENIED]: 'denied',
}

export class ContractInteraction {
  private contractAddress: string
  private provider: ethers.Provider | null = null
  private signer: ethers.Signer | null = null
  private contract: ethers.Contract | null = null

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress
    if (contractAddress === 'MOCK') {
      console.log('[ContractInteraction] Using mock mode (no contract)')
    }
  }

  /**
   * Initialize the contract interaction with a signer
   */
  async initialize(provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider
    this.signer = signer
    this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, signer)
  }

  /**
   * Get the current user's role from the blockchain
   */
  async getUserRole(address: string): Promise<Role> {
    if (!this.contract) throw new Error('Contract not initialized')
    const roleNum = await this.contract.getUserRole(address)
    return parseInt(roleNum.toString()) as Role
  }

  /**
   * Check access level for a specific field
   */
  async checkFieldAccess(userAddress: string, fieldIndex: number): Promise<AccessType> {
    if (!this.contract) throw new Error('Contract not initialized')
    const accessNum = await this.contract.checkFieldAccess(userAddress, fieldIndex)
    return parseInt(accessNum.toString()) as AccessType
  }

  /**
   * Verify and log access (emit event on blockchain)
   */
  async verifyAndLogAccess(fieldIndex: number) {
    if (!this.contract) throw new Error('Contract not initialized')
    
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    try {
      const tx = await this.contract.verifyAndLogAccess(fieldIndex)
      const receipt = await tx.wait()
      console.log('[ContractInteraction] Access verification transaction:', receipt.hash)
      return receipt
    } catch (error: any) {
      console.error('[ContractInteraction] Error verifying access:', error)
      throw error
    }
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return this.contractAddress
  }

  /**
   * Check if contract is initialized
   */
  isInitialized(): boolean {
    return this.contract !== null
  }
}

/**
 * Get Web3 provider from MetaMask
 */
export function getWeb3Provider(): ethers.BrowserProvider {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }
  return new ethers.BrowserProvider(window.ethereum)
}

/**
 * Get signer from MetaMask
 */
export async function getSigner(): Promise<ethers.Signer> {
  const provider = getWeb3Provider()
  return provider.getSigner()
}

/**
 * Switch to Sepolia network
 */
export async function switchToSepolia() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
    })
  } catch (error: any) {
    // If the chain is not added to MetaMask, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0xaa36a7',
            chainName: 'Sepolia',
            rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      })
    } else {
      throw error
    }
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}
