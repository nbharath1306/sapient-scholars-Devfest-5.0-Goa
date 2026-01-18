'use client'

import React from "react"
import { useMetaMask } from '@/app/providers'
import type { Role } from '@/lib/smartContract'
import { Crown, Code, Megaphone, Wallet, AlertCircle } from 'lucide-react'

const roles: { id: Role; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'founder',
    label: 'Founder',
    icon: <Crown className="w-5 h-5" />,
    description: 'Full access to all documents',
  },
  {
    id: 'engineer',
    label: 'Engineer',
    icon: <Code className="w-5 h-5" />,
    description: 'Limited technical access',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: <Megaphone className="w-5 h-5" />,
    description: 'Semantic content masking',
  },
]

export function RoleSwitcher() {
  const { isConnected, currentRole, hasAccess, account } = useMetaMask()

  // Not connected state
  if (!isConnected) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground">Your Role</p>
        <div className="p-4 rounded-lg border-2 border-dashed border-border bg-muted/20">
          <div className="flex flex-col items-center gap-2 text-center">
            <Wallet className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Connect Wallet</p>
              <p className="text-xs text-muted-foreground">
                Connect your MetaMask wallet to view your assigned role
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Connected but no role assigned
  if (!hasAccess || !currentRole) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground">Your Role</p>
        <div className="p-4 rounded-lg border-2 border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <div>
              <p className="font-medium text-sm text-amber-600 dark:text-amber-400">No Role Assigned</p>
              <p className="text-xs text-muted-foreground">
                Your wallet ({account?.slice(0, 6)}...{account?.slice(-4)}) hasn't been assigned a role yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Contact the document owner to get access
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Has role - show current role
  const currentRoleInfo = roles.find(r => r.id === currentRole)

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-muted-foreground">Your Role</p>
      <div className="grid grid-cols-1 gap-2">
        {roles.map((role) => {
          const isCurrentRole = currentRole === role.id
          
          return (
            <div
              key={role.id}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                isCurrentRole
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border/30 opacity-40'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={`transition-colors ${
                    isCurrentRole ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {role.icon}
                </div>
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {role.label}
                    {isCurrentRole && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{role.description}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border/50">
        Role assigned by document owner based on your wallet address
      </p>
    </div>
  )
}
