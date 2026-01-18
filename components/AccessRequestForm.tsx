'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMetaMask } from '@/app/providers'
import type { Role } from '@/lib/smartContract'
import { 
  submitAccessRequest, 
  getRequestStatus, 
  subscribeToRequestStatus,
  subscribeToWalletRole,
  type AccessRequest 
} from '@/lib/storage'
import { 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Crown, 
  Code, 
  Megaphone,
  User,
  Loader2,
  Shield
} from 'lucide-react'

const roleOptions: { id: Role; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'owner', label: 'Owner', icon: <Shield className="w-4 h-4" />, description: 'Full admin access with role management' },
  { id: 'founder', label: 'Founder', icon: <Crown className="w-4 h-4" />, description: 'Full access to all documents' },
  { id: 'engineer', label: 'Engineer', icon: <Code className="w-4 h-4" />, description: 'Technical access with some restrictions' },
  { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-4 h-4" />, description: 'Marketing access with AI masking' },
]

export function AccessRequestForm() {
  const { account, isConnected, hasAccess, refreshRole } = useMetaMask()
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('engineer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestStatus, setRequestStatus] = useState<AccessRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing request status on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (account) {
        setIsLoading(true)
        try {
          const status = await getRequestStatus(account)
          setRequestStatus(status)
          
          // If approved, refresh role
          if (status?.status === 'approved') {
            await refreshRole()
          }
        } catch (err) {
          console.error('Failed to check request status:', err)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }
    
    checkStatus()
  }, [account, refreshRole])

  // Subscribe to realtime updates for request status
  useEffect(() => {
    if (!account || hasAccess) return
    
    const unsubscribeRequest = subscribeToRequestStatus(account, (request) => {
      setRequestStatus(request)
      if (request?.status === 'approved') {
        refreshRole()
      }
    })
    
    const unsubscribeRole = subscribeToWalletRole(account, (role) => {
      if (role) {
        refreshRole()
      }
    })
    
    return () => {
      unsubscribeRequest()
      unsubscribeRole()
    }
  }, [account, hasAccess, refreshRole])

  const handleSubmit = async () => {
    setError(null)
    
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    
    if (!account) {
      setError('Wallet not connected')
      return
    }

    setIsSubmitting(true)
    
    try {
      const request = await submitAccessRequest(account, name.trim(), selectedRole)
      if (request) {
        setRequestStatus(request)
      } else {
        setError('Failed to submit request. Please try again.')
      }
    } catch (err) {
      setError('Failed to submit request. Please try again.')
      console.error('Failed to submit access request:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't show if not connected or already has access
  if (!isConnected || hasAccess) {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-6 border-border/50">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  // Show pending status
  if (requestStatus?.status === 'pending') {
    return (
      <Card className="p-6 border-amber-500/30 bg-amber-500/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-amber-600 dark:text-amber-400">
              Request Pending
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Hi <span className="font-medium">{requestStatus.name}</span>, your request for{' '}
              <span className="font-medium capitalize">{requestStatus.requestedRole}</span> access is being reviewed.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              The document owner will approve or decline your request.
            </p>
            <p className="text-xs text-primary mt-2">
              ✨ This page will automatically update when your request is reviewed.
            </p>
          </div>
          <div className="pt-2 border-t border-amber-500/20">
            <p className="text-xs text-muted-foreground">
              Submitted {new Date(requestStatus.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Show declined status
  if (requestStatus?.status === 'declined') {
    return (
      <Card className="p-6 border-red-500/30 bg-red-500/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">
              Request Declined
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your request for <span className="font-medium capitalize">{requestStatus.requestedRole}</span> access was declined.
            </p>
          </div>
          <Button 
            onClick={() => setRequestStatus(null)} 
            variant="outline"
            className="mt-2"
          >
            Submit New Request
          </Button>
        </div>
      </Card>
    )
  }

  // Show request form
  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-5">
        <div className="text-center">
          <h3 className="font-semibold text-lg">Request Access</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in your details to request access to this document
          </p>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Request Access As</label>
          <div className="grid gap-2">
            {roleOptions.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedRole === role.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'}>
                    {role.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{role.label}</div>
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Wallet Display */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground">Requesting from wallet:</p>
          <p className="text-sm font-mono mt-1">{account}</p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Access Request
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
