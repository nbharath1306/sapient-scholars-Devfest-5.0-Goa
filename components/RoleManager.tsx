'use client'

import { useState, useEffect } from 'react'
import { useMetaMask } from '@/app/providers'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Role } from '@/lib/smartContract'
import type { WalletRole } from '@/lib/storage'
import { Crown, Code, Megaphone, UserPlus, Trash2, Copy, Check, Shield, Loader2 } from 'lucide-react'

const roleOptions: { id: Role; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'owner', label: 'Owner', icon: <Shield className="w-4 h-4" />, color: 'text-green-500' },
  { id: 'founder', label: 'Founder', icon: <Crown className="w-4 h-4" />, color: 'text-yellow-500' },
  { id: 'engineer', label: 'Engineer', icon: <Code className="w-4 h-4" />, color: 'text-blue-500' },
  { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-4 h-4" />, color: 'text-purple-500' },
]

export function RoleManager() {
  const { isOwner, assignRoleToWallet, removeWalletRole, getAllWallets, getOwnerAddress, account } = useMetaMask()
  const [newWallet, setNewWallet] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('engineer')
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [wallets, setWallets] = useState<WalletRole[]>([])
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  // Fetch wallets on mount and when needed
  const fetchWallets = async () => {
    setIsLoading(true)
    try {
      const [allWallets, owner] = await Promise.all([
        getAllWallets(),
        getOwnerAddress()
      ])
      setWallets(allWallets)
      setOwnerAddress(owner)
    } catch (err) {
      console.error('Failed to fetch wallets:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchWallets()
    }
  }, [isOwner])

  const handleAssignRole = async () => {
    setError(null)
    
    // Validate wallet address
    if (!newWallet.trim()) {
      setError('Please enter a wallet address')
      return
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWallet.trim())) {
      setError('Invalid wallet address format')
      return
    }

    setIsAssigning(true)
    try {
      await assignRoleToWallet(newWallet.trim(), selectedRole)
      setNewWallet('')
      await fetchWallets()
    } catch (err) {
      setError('Failed to assign role')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveRole = async (address: string) => {
    try {
      await removeWalletRole(address)
      await fetchWallets()
    } catch (err) {
      console.error('Failed to remove role:', err)
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getRoleInfo = (role: Role) => {
    return roleOptions.find(r => r.id === role) || roleOptions[0]
  }

  if (!isOwner) {
    return null
  }

  return (
    <Card className="p-4 border-border/50">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Role Management</h3>
        </div>
        
        <p className="text-xs text-muted-foreground">
          As the owner, you can assign roles to other wallet addresses.
        </p>

        {/* Add New Role */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Assign New Role</span>
          </div>
          
          <input
            type="text"
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            placeholder="0x... wallet address"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          
          <div className="grid grid-cols-2 gap-1">
            {roleOptions.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`px-2 py-1.5 text-xs rounded-md border transition-all ${
                  selectedRole === role.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  {role.icon}
                  <span>{role.label}</span>
                </div>
              </button>
            ))}
          </div>
          
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          
          <Button onClick={handleAssignRole} size="sm" className="w-full" disabled={isAssigning}>
            {isAssigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Role'
            )}
          </Button>
        </div>

        {/* Assigned Wallets List */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Assigned Wallets</p>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : wallets.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No wallets assigned yet</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {wallets.map(({ address, role, isOwner: isWalletOwner, name }) => {
                const roleInfo = getRoleInfo(role)
                const isCurrentUser = address.toLowerCase() === account?.toLowerCase()
                
                return (
                  <div
                    key={address}
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      isCurrentUser ? 'bg-primary/5 border-primary/30' : 'bg-muted/20 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={roleInfo.color}>{roleInfo.icon}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          {name && (
                            <span className="text-xs font-medium">{name}</span>
                          )}
                          {isWalletOwner && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                              Owner
                            </span>
                          )}
                          {isCurrentUser && !isWalletOwner && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-primary/20 text-primary">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-muted-foreground">{formatAddress(address)}</span>
                          <span className="text-[10px] text-muted-foreground">• {roleInfo.label}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyAddress(address)}
                        className="p-1 rounded hover:bg-muted transition-colors"
                        title="Copy address"
                      >
                        {copiedAddress === address ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                      
                      {!isWalletOwner && (
                        <button
                          onClick={() => handleRemoveRole(address)}
                          className="p-1 rounded hover:bg-destructive/10 transition-colors"
                          title="Remove role"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
