'use client'

import { useState, useEffect } from 'react'
import { WalletHeader } from '@/components/WalletHeader'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { DocumentField } from '@/components/DocumentField'
import { useMetaMask } from '@/app/providers'
import {
  masterDocument,
  checkAccess,
  type Role,
} from '@/lib/smartContract'
import { Card } from '@/components/ui/card'
import { Zap, Lock } from 'lucide-react'

export default function Home() {
  const { isConnected } = useMetaMask()
  const [currentRole, setCurrentRole] = useState<Role>('founder')
  const [accessCache, setAccessCache] = useState<Record<string, any>>({})

  // Precompute access policies
  useEffect(() => {
    const cache: Record<string, any> = {}
    Object.keys(masterDocument).forEach((field) => {
      cache[field] = checkAccess(currentRole, field as keyof typeof masterDocument)
    })
    setAccessCache(cache)
  }, [currentRole])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Event Horizon</h1>
                <p className="text-xs text-muted-foreground">Blockchain Access Control System</p>
              </div>
            </div>
            <WalletHeader />
          </div>
        </div>
      </header>

      {/* Connection Warning */}
      {!isConnected && (
        <div className="sticky top-0 z-40 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Connect your wallet</span> to verify your identity with the blockchain access control system.
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Role Switcher Card */}
              <Card className="p-4 border-border/50">
                <RoleSwitcher currentRole={currentRole} onRoleChange={setCurrentRole} />
              </Card>

              {/* Info Card */}
              <Card className="p-4 border-border/50 bg-primary/5">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Smart Contract Rules</p>
                      <p className="text-xs text-muted-foreground">
                        All permissions are verified on-chain. Different roles see different data based on immutable blockchain rules.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Role Legend */}
              <Card className="p-4 border-border/50">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">Access Legend</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Full Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span>Partially Masked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Semantically Masked (AI)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>Access Denied</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <div className="mb-8">
              <div className="space-y-2 mb-6">
                <h2 className="text-3xl font-bold text-foreground">Master Strategy Document</h2>
                <p className="text-muted-foreground">
                  You are viewing this document as <span className="font-semibold text-primary capitalize">{currentRole}</span>. 
                  The blockchain enforces role-based access to sensitive information.
                </p>
              </div>

              {/* Document Info */}
              <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">Secured by Blockchain</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This document is protected by smart contract rules deployed on Sepolia blockchain. Access policies are immutable and transparent.
                  </p>
                </div>
              </Card>
            </div>

            {/* Document Fields Grid */}
            <div className="space-y-4">
              {Object.entries(masterDocument).map(([key, field]) => {
                const access = accessCache[key]
                if (!access) return null

                return (
                  <DocumentField
                    key={key}
                    fieldName={field.name}
                    fieldValue={field.value}
                    sensitivity={field.sensitivity}
                    accessType={access.type}
                    role={currentRole}
                  />
                )
              })}
            </div>

            {/* Footer Info */}
            <Card className="mt-8 p-4 border-border/50 bg-muted/30">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <span className="font-semibold">How it works:</span> When you switch roles, the blockchain verifies your new role permissions. Different fields are displayed, masked, or hidden based on immutable smart contract rules.
                </p>
                <p>
                  Try switching to <span className="font-semibold">Engineer</span> to see how sensitive risks are hidden, or <span className="font-semibold">Marketing</span> to see AI-powered semantic masking in action.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
