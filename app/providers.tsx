'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface MetaMaskContextType {
  account: string | null
  isConnected: boolean
  isLoading: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined)

export function MetaMaskProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if MetaMask is available and connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          })
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0])
            setIsConnected(true)
          }
        } catch (error) {
          console.error('Failed to check MetaMask connection:', error)
        }
      }
    }

    checkConnection()
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
      }
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setIsConnected(false)
  }

  return (
    <MetaMaskContext.Provider value={{ account, isConnected, isLoading, connect, disconnect }}>
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
