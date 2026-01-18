'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'
import { ContractInteraction, switchToSepolia } from '@/lib/contractInteraction'

interface MetaMaskContextType {
  account: string | null
  isConnected: boolean
  isLoading: boolean
  chainId: string | null
  isCorrectChain: boolean
  contract: ContractInteraction | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  connect: () => Promise<void>
  disconnect: () => void
  switchChain: () => Promise<void>
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined)

export function MetaMaskProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chainId, setChainId] = useState<string | null>(null)
  const [contract, setContract] = useState<ContractInteraction | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)

  const SEPOLIA_CHAIN_ID = '11155111'
  const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x'

  const isCorrectChain = chainId === SEPOLIA_CHAIN_ID

  // Check if MetaMask is available and connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Get connected accounts
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          })

          // Get chain ID
          const chainIdHex = await window.ethereum.request({
            method: 'eth_chainId',
          })
          const chainIdNum = parseInt(chainIdHex, 16).toString()
          setChainId(chainIdNum)

          if (accounts && accounts.length > 0) {
            setAccount(accounts[0])
            setIsConnected(true)

            // Initialize provider and signer
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            setProvider(provider)
            setSigner(signer)

            // Initialize contract
            if (CONTRACT_ADDRESS !== '0x') {
              const contractInteraction = new ContractInteraction(CONTRACT_ADDRESS)
              await contractInteraction.initialize(provider, signer)
              setContract(contractInteraction)
            }
          }
        } catch (error) {
          console.error('[MetaMaskProvider] Failed to check connection:', error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        } else {
          setAccount(null)
          setIsConnected(false)
        }
      })

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        const chainIdNum = parseInt(chainIdHex, 16).toString()
        setChainId(chainIdNum)
      })
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {})
        window.ethereum.removeListener('chainChanged', () => {})
      }
    }
  }, [])

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask')
      return
    }

    setIsLoading(true)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)

        // Initialize provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        setProvider(provider)
        setSigner(signer)

        // Get chain ID
        const chainIdHex = await window.ethereum.request({
          method: 'eth_chainId',
        })
        const chainIdNum = parseInt(chainIdHex, 16).toString()
        setChainId(chainIdNum)

        // Initialize contract
        if (CONTRACT_ADDRESS !== '0x') {
          const contractInteraction = new ContractInteraction(CONTRACT_ADDRESS)
          await contractInteraction.initialize(provider, signer)
          setContract(contractInteraction)
        }

        // Switch to Sepolia if not already connected
        if (chainIdNum !== SEPOLIA_CHAIN_ID) {
          await switchToSepolia()
        }
      }
    } catch (error) {
      console.error('[MetaMaskProvider] Failed to connect:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setIsConnected(false)
    setContract(null)
    setProvider(null)
    setSigner(null)
  }

  const switchChain = async () => {
    try {
      await switchToSepolia()
    } catch (error) {
      console.error('[MetaMaskProvider] Failed to switch chain:', error)
    }
  }

  return (
    <MetaMaskContext.Provider
      value={{
        account,
        isConnected,
        isLoading,
        chainId,
        isCorrectChain,
        contract,
        provider,
        signer,
        connect,
        disconnect,
        switchChain,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  )
}

export function useMetaMask() {
  const context = useContext(MetaMaskContext)
  if (!context) {
    throw new Error('useMetaMask must be used within MetaMaskProvider')
  }
  return context
}

// Extend window type for MetaMask
declare global {
  interface Window {
    ethereum?: any
  }
}
