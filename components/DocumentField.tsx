'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPartialMask, verifyBlockchainAccess, type Role } from '@/lib/smartContract'
import { useMetaMask } from '@/app/providers'
import { Lock, Eye, Sparkles, Zap } from 'lucide-react'

interface DocumentFieldProps {
  fieldName: string
  fieldValue: string
  sensitivity: 'public' | 'sensitive' | 'critical'
  accessType: 'full' | 'partial' | 'semantic' | 'denied'
  role: Role
}

export function DocumentField({
  fieldName,
  fieldValue,
  sensitivity,
  accessType,
  role,
}: DocumentFieldProps) {
  const { account, contract } = useMetaMask()
  const [displayValue, setDisplayValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [semanticContent, setSemanticContent] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Verify access via blockchain
  useEffect(() => {
    setIsVerifying(true)
    const verify = async () => {
      if (account) {
        try {
          await verifyBlockchainAccess(contract, account, fieldName as any)
        } catch (error) {
          console.error('[DocumentField] Error verifying access:', error)
        }
      }
      setIsVerifying(false)
    }
    verify()
  }, [account, contract, fieldName, role])

  // Update display based on access type
  useEffect(() => {
    if (accessType === 'full') {
      setDisplayValue(fieldValue)
    } else if (accessType === 'partial') {
      setDisplayValue(getPartialMask(fieldValue))
    } else if (accessType === 'semantic') {
      setDisplayValue(fieldValue)
    } else {
      setDisplayValue('ACCESS DENIED')
    }
  }, [fieldValue, accessType])

  const handleSemanticUnmask = async () => {
    if (semanticContent) {
      setSemanticContent(null)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/mask-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fieldValue, role }),
      })
      const data = await response.json()
      setSemanticContent(data.masked)
    } catch (error) {
      console.error('Failed to mask content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSensitivityColor = (s: string) => {
    switch (s) {
      case 'critical':
        return 'bg-destructive/10 text-destructive'
      case 'sensitive':
        return 'bg-accent/10 text-accent'
      default:
        return 'bg-secondary/10 text-secondary'
    }
  }

  const getAccessIcon = () => {
    if (accessType === 'denied') return <Lock className="w-4 h-4" />
    if (accessType === 'semantic') return <Sparkles className="w-4 h-4" />
    return <Eye className="w-4 h-4" />
  }

  return (
    <Card className="p-4 animate-slide-in-up hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{fieldName}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getSensitivityColor(sensitivity)}>
              {sensitivity}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getAccessIcon()}
              <span>
                {accessType === 'denied'
                  ? 'Blocked'
                  : accessType === 'partial'
                    ? 'Masked'
                    : accessType === 'semantic'
                      ? 'AI Masked'
                      : 'Full Access'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {isVerifying ? (
            <div className="h-8 bg-muted rounded animate-pulse flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Verifying blockchain...</span>
            </div>
          ) : accessType === 'denied' ? (
            <div className="h-8 flex items-center px-3 rounded bg-destructive/5 border border-destructive/20">
              <span className="text-sm font-medium text-destructive">🔒 Access Denied - Insufficient permissions</span>
            </div>
          ) : semanticContent ? (
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-sm text-foreground">{semanticContent}</p>
              <p className="text-xs text-muted-foreground mt-2">
                ✨ AI-generated semantic alternative
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 font-mono text-sm text-foreground break-all">
              {displayValue}
            </div>
          )}
        </div>

        {/* Semantic Unmask Button */}
        {accessType === 'semantic' && (
          <button
            onClick={handleSemanticUnmask}
            disabled={isLoading}
            className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
              bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30 hover:border-accent/50
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Processing...
              </>
            ) : semanticContent ? (
              <>
                <Eye className="w-4 h-4" />
                Hide AI Content
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                View AI-Masked Content
              </>
            )}
          </button>
        )}

        {/* Access Info */}
        <div className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted/30">
          {accessType === 'denied' && 'Blockchain rule: This role cannot access this field'}
          {accessType === 'partial' && 'Blockchain rule: Partial masking applied for security'}
          {accessType === 'semantic' && 'Blockchain rule: Semantic masking via Gemini AI'}
          {accessType === 'full' && 'Blockchain rule: Full access granted for this role'}
        </div>

        {/* Blockchain Verification Status */}
        {txHash && (
          <div className="text-xs flex items-center gap-2 px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary">
            <Zap className="w-3 h-3 flex-shrink-0" />
            <span>Verified on blockchain</span>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-foreground truncate"
              title={txHash}
            >
              {txHash.slice(0, 10)}...
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}
