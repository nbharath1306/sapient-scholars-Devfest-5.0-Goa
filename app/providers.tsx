'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import type { Role } from '@/lib/smartContract'
import {
  getWalletRole,
  setOwnerWallet,
  isOwner as checkIsOwner,
  hasOwner,
  assignRole,
  removeRole,
  getAllAssignedWallets,
  getOwnerWallet,
  type WalletRole,
} from '@/lib/storage'

interface MetaMaskContextType {
  account: string | null
  isConnected: boolean
  isLoading: boolean
  connect: () => Promise<void>
  disconnect: () => void
  // Role management
  currentRole: Role | null
  isOwner: boolean
  hasAccess: boolean
  isInitializing: boolean
  // Owner functions
  assignRoleToWallet: (wallet: string, role: Role) => Promise<void>
  removeWalletRole: (wallet: string) => Promise<void>
  getAllWallets: () => Promise<WalletRole[]>
  getOwnerAddress: () => Promise<string | null>
  refreshRole: () => Promise<void>
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined)

export function MetaMaskProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [isOwnerWallet, setIsOwnerWallet] = useState(false)

  // Refresh role from Supabase
  const refreshRole = useCallback(async () => {
    if (account) {
      const role = await getWalletRole(account)
      setCurrentRole(role)
      const ownerStatus = await checkIsOwner(account)
      setIsOwnerWallet(ownerStatus)
    }
  }, [account])

  // Initialize role when account changes
  useEffect(() => {
    const initializeRole = async () => {
      if (account) {
        setIsInitializing(true)
        try {
          // If no owner exists, this wallet becomes the owner
          const ownerExists = await hasOwner()
          if (!ownerExists) {
            await setOwnerWallet(account)
            setCurrentRole('founder')
            setIsOwnerWallet(true)
          } else {
            // Check if this wallet has an assigned role
            const role = await getWalletRole(account)
            setCurrentRole(role)
            const ownerStatus = await checkIsOwner(account)
            setIsOwnerWallet(ownerStatus)
          }
        } catch (error) {
          console.error('Failed to initialize role:', error)
        } finally {
          setIsInitializing(false)
        }
      } else {
        setCurrentRole(null)
        setIsOwnerWallet(false)
        setIsInitializing(false)
      }
    }

    initializeRole()
  }, [account])

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null)
          setIsConnected(false)
          setCurrentRole(null)
          setIsOwnerWallet(false)
        } else {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

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
          } else {
            setIsInitializing(false)
          }
        } catch (error) {
          console.error('Failed to check MetaMask connection:', error)
          setIsInitializing(false)
        }
      } else {
        setIsInitializing(false)
      }
    }

    checkConnection()
  }, [])

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application')
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
    setCurrentRole(null)
    setIsOwnerWallet(false)
  }

  // Owner functions
  const assignRoleToWallet = async (wallet: string, role: Role) => {
    if (!isOwnerWallet) return
    await assignRole(wallet, role)
    await refreshRole()
  }

  const removeWalletRole = async (wallet: string) => {
    if (!isOwnerWallet) return
    // Can't remove owner's role
    const isWalletOwner = await checkIsOwner(wallet)
    if (isWalletOwner) return
    await removeRole(wallet)
    await refreshRole()
  }

  const getAllWallets = async () => {
    return getAllAssignedWallets()
  }

  const getOwnerAddress = async () => {
    return getOwnerWallet()
  }

  // hasAccess = connected wallet has an assigned role
  const hasAccess = isConnected && currentRole !== null

  return (
    <MetaMaskContext.Provider
      value={{
        account,
        isConnected,
        isLoading,
        connect,
        disconnect,
        currentRole,
        isOwner: isOwnerWallet,
        hasAccess,
        isInitializing,
        assignRoleToWallet,
        removeWalletRole,
        getAllWallets,
        getOwnerAddress,
        refreshRole,
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
