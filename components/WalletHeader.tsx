'use client'

import { useMetaMask } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Wallet, AlertCircle } from 'lucide-react'

export function WalletHeader() {
  const { account, isConnected, isLoading, isCorrectChain, chainId, connect, disconnect, switchChain } = useMetaMask()

  const displayAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''

  return (
    <div className="flex flex-col gap-3">
      {isConnected && !isCorrectChain && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Wrong chain (Chain ID: {chainId})</span>
          <Button
            onClick={switchChain}
            variant="ghost"
            size="sm"
            className="ml-auto text-xs h-6 px-2"
          >
            Switch to Sepolia
          </Button>
        </div>
      )}
      <div className="flex items-center gap-3">
        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">{displayAddress}</span>
              {isCorrectChain && <span className="text-xs text-primary/60 ml-1">Sepolia</span>}
            </div>
            <Button
              onClick={disconnect}
              variant="outline"
              size="sm"
              className="text-xs bg-transparent"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            onClick={connect}
            disabled={isLoading}
            size="sm"
            className="gap-2"
          >
            <Wallet className="w-4 h-4" />
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </div>
    </div>
  )
}
