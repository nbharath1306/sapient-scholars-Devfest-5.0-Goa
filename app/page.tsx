'use client'

import { useState, useEffect } from 'react'
import { WalletHeader } from '@/components/WalletHeader'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { RoleManager } from '@/components/RoleManager'
import { AccessRequestForm } from '@/components/AccessRequestForm'
import { AccessRequestsDashboard } from '@/components/AccessRequestsDashboard'
import { DocumentField } from '@/components/DocumentField'
import { useMetaMask } from '@/app/providers'
import {
  masterDocument,
  checkAccess,
  type Role,
} from '@/lib/smartContract'
import { Card } from '@/components/ui/card'
import { Zap, Lock, Shield } from 'lucide-react'

export default function Home() {
  const { isConnected, currentRole, hasAccess, isOwner } = useMetaMask()
  const [accessCache, setAccessCache] = useState<Record<string, any>>({})

  // Precompute access policies when role changes
  useEffect(() => {
    if (currentRole) {
      const cache: Record<string, any> = {}
      Object.keys(masterDocument).forEach((field) => {
        cache[field] = checkAccess(currentRole, field as keyof typeof masterDocument)
      })
      setAccessCache(cache)
    } else {
      setAccessCache({})
    }
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
              <span className="font-semibold">Connect your wallet</span> to verify your identity and access documents based on your assigned role.
            </div>
          </div>
        </div>
      )}

      {/* Owner Badge */}
      {isOwner && (
        <div className="sticky top-0 z-40 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="text-sm text-green-800 dark:text-green-200">
              <span className="font-semibold">Owner Mode</span> - You can manage roles and review access requests in the sidebar.
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
                <RoleSwitcher />
              </Card>

              {/* Access Requests Dashboard (only for owner) */}
              <AccessRequestsDashboard />

              {/* Role Manager (only for owner) */}
              <RoleManager />

              {/* Info Card */}
              <Card className="p-4 border-border/50 bg-primary/5">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Wallet-Based Access</p>
                      <p className="text-xs text-muted-foreground">
                        Your role is determined by your connected wallet address. The document owner assigns roles to specific wallets.
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
                {hasAccess && currentRole ? (
                  <p className="text-muted-foreground">
                    You are viewing this document as <span className="font-semibold text-primary capitalize">{currentRole}</span>. 
                    Access is controlled by your wallet address.
                  </p>
                ) : isConnected ? (
                  <p className="text-muted-foreground">
                    Your wallet does not have access to view this document. Please contact the owner.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Connect your wallet to view documents based on your assigned role.
                  </p>
                )}
              </div>

              {/* Document Info */}
              <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">Wallet-Based Access Control</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This document uses wallet-based role assignment. The first wallet to connect becomes the owner and can assign roles to other wallets.
                  </p>
                </div>
              </Card>
            </div>

            {/* Document Fields Grid - Only show if user has access */}
            {hasAccess && currentRole ? (
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
            ) : isConnected ? (
              /* Show Access Request Form for connected users without access */
              <AccessRequestForm />
            ) : (
              /* Show locked state for non-connected users */
              <Card className="p-8 border-border/50 bg-muted/20">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Document Locked</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connect your wallet to request access to this document.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Footer Info */}
            <Card className="mt-8 p-4 border-border/50 bg-muted/30">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <span className="font-semibold">How it works:</span> The first wallet to connect becomes the document owner with Founder access. The owner can then assign roles (Engineer, Marketing) to other wallet addresses.
                </p>
                <p>
                  Each role has different access levels: <span className="font-semibold">Founders</span> see everything, <span className="font-semibold">Engineers</span> have partial access with some fields masked, and <span className="font-semibold">Marketing</span> sees AI-powered semantic masking for sensitive data.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
