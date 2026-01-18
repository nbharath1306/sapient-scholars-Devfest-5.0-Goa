'use client'

import { useMetaMask } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export function WalletHeader() {
  const { account, isConnected, isLoading, connect, disconnect } = useMetaMask()

  const displayAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''

  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">{displayAddress}</span>
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
  )
}
