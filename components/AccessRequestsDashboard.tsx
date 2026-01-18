'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMetaMask } from '@/app/providers'
import type { Role } from '@/lib/smartContract'
import { 
  getPendingRequests, 
  approveAccessRequest, 
  declineAccessRequest,
  subscribeToAccessRequests,
  type AccessRequest 
} from '@/lib/storage'
import { 
  Bell, 
  Check, 
  X, 
  Crown, 
  Code, 
  Megaphone,
  Clock,
  User,
  ChevronDown,
  Inbox,
  Loader2,
  Shield
} from 'lucide-react'

const roleOptions: { id: Role; label: string; icon: React.ReactNode }[] = [
  { id: 'owner', label: 'Owner', icon: <Shield className="w-4 h-4" /> },
  { id: 'founder', label: 'Founder', icon: <Crown className="w-4 h-4" /> },
  { id: 'engineer', label: 'Engineer', icon: <Code className="w-4 h-4" /> },
  { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-4 h-4" /> },
]

export function AccessRequestsDashboard() {
  const { isOwner } = useMetaMask()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [selectedRoles, setSelectedRoles] = useState<Record<string, Role>>({})
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Fetch pending requests
  const fetchRequests = async () => {
    try {
      const pending = await getPendingRequests()
      setRequests(pending)
      
      // Initialize selected roles with requested roles
      const roles: Record<string, Role> = {}
      pending.forEach(req => {
        if (!selectedRoles[req.id]) {
          roles[req.id] = req.requestedRole
        }
      })
      setSelectedRoles(prev => ({ ...prev, ...roles }))
    } catch (err) {
      console.error('Failed to fetch requests:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchRequests()
      
      // Subscribe to realtime updates
      const unsubscribe = subscribeToAccessRequests((updatedRequests) => {
        setRequests(updatedRequests)
        
        // Initialize selected roles for new requests
        const roles: Record<string, Role> = {}
        updatedRequests.forEach(req => {
          if (!selectedRoles[req.id]) {
            roles[req.id] = req.requestedRole
          }
        })
        if (Object.keys(roles).length > 0) {
          setSelectedRoles(prev => ({ ...prev, ...roles }))
        }
      })
      
      return () => unsubscribe()
    }
  }, [isOwner])

  const handleApprove = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId))
    try {
      const roleToAssign = selectedRoles[requestId]
      await approveAccessRequest(requestId, roleToAssign)
      await fetchRequests()
    } catch (err) {
      console.error('Failed to approve request:', err)
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }
  }

  const handleDecline = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId))
    try {
      await declineAccessRequest(requestId)
      await fetchRequests()
    } catch (err) {
      console.error('Failed to decline request:', err)
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getRoleInfo = (role: Role) => {
    return roleOptions.find(r => r.id === role) || roleOptions[1]
  }

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (!isOwner) {
    return null
  }

  return (
    <Card className="p-4 border-border/50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Access Requests</h3>
          </div>
          {requests.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              {requests.length} pending
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-6 text-center">
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          /* Empty State */
          <div className="py-6 text-center">
            <Inbox className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No pending requests</p>
            <p className="text-xs text-muted-foreground mt-1">
              New requests will appear here in realtime
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {requests.map((request) => {
              const roleInfo = getRoleInfo(selectedRoles[request.id] || request.requestedRole)
              const isExpanded = expandedRequest === request.id
              const isProcessing = processingIds.has(request.id)
              
              return (
                <div
                  key={request.id}
                  className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-3"
                >
                  {/* Request Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{request.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatAddress(request.walletAddress)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(request.timestamp)}
                    </div>
                  </div>

                  {/* Requested Role */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Requested:</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {getRoleInfo(request.requestedRole).icon}
                      <span className="capitalize">{request.requestedRole}</span>
                    </span>
                  </div>

                  {/* Role Selection (Collapsible) */}
                  <button
                    onClick={() => setExpandedRequest(isExpanded ? null : request.id)}
                    className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>Change role before approving</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="grid grid-cols-4 gap-1">
                      {roleOptions.map((role) => (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRoles(prev => ({ ...prev, [request.id]: role.id }))}
                          className={`p-1.5 text-xs rounded border transition-all ${
                            selectedRoles[request.id] === role.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            {role.icon}
                            <span className="text-[10px]">{role.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons - Stack on small screens */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/50">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      size="sm"
                      className="flex-1 gap-1 text-xs h-8"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          Approve ({getRoleInfo(selectedRoles[request.id] || request.requestedRole).label})
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleDecline(request.id)}
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={isProcessing}
                    >
                      <X className="w-3 h-3" />
                      Decline
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
