// Supabase-based storage for wallet roles and access requests

import { supabase, isSupabaseConfigured } from './supabase'
import type { Role } from './smartContract'

export interface WalletRole {
  address: string
  role: Role
  isOwner: boolean
  name?: string
}

export interface AccessRequest {
  id: string
  walletAddress: string
  name: string
  requestedRole: Role
  status: 'pending' | 'approved' | 'declined'
  timestamp: string
  reviewedAt?: string
}

// ============ WALLET ROLES ============

// Get role for a specific wallet
export async function getWalletRole(walletAddress: string): Promise<Role | null> {
  if (!supabase) return null
  const normalizedAddress = walletAddress.toLowerCase()
  
  const { data, error } = await supabase
    .from('wallet_roles')
    .select('role')
    .eq('wallet_address', normalizedAddress)
    .single()
  
  if (error || !data) return null
  return data.role as Role
}

// Check if a wallet is the owner
export async function isOwner(walletAddress: string): Promise<boolean> {
  if (!supabase) return false
  const normalizedAddress = walletAddress.toLowerCase()
  
  const { data, error } = await supabase
    .from('wallet_roles')
    .select('is_owner')
    .eq('wallet_address', normalizedAddress)
    .single()
  
  if (error || !data) return false
  return data.is_owner
}

// Check if system has an owner
export async function hasOwner(): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase
    .from('wallet_roles')
    .select('id')
    .eq('is_owner', true)
    .limit(1)
  
  if (error) return false
  return data && data.length > 0
}

// Get owner wallet address
export async function getOwnerWallet(): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('wallet_roles')
    .select('wallet_address')
    .eq('is_owner', true)
    .single()
  
  if (error || !data) return null
  return data.wallet_address
}

// Set owner wallet (only if not already set)
export async function setOwnerWallet(walletAddress: string): Promise<boolean> {
  if (!supabase) return false
  const normalizedAddress = walletAddress.toLowerCase()
  
  // Check if owner already exists
  const ownerExists = await hasOwner()
  if (ownerExists) return false
  
  const { error } = await supabase
    .from('wallet_roles')
    .insert({
      wallet_address: normalizedAddress,
      role: 'founder',
      is_owner: true,
    })
  
  return !error
}

// Assign role to a wallet
export async function assignRole(walletAddress: string, role: Role, name?: string): Promise<boolean> {
  if (!supabase) return false
  const normalizedAddress = walletAddress.toLowerCase()
  const isOwnerRole = role === 'owner'
  
  // Check if wallet already has a role
  const existing = await getWalletRole(normalizedAddress)
  
  if (existing) {
    // Update existing role (and name if provided)
    const updateData: { role: Role; is_owner: boolean; name?: string } = { role, is_owner: isOwnerRole }
    if (name) updateData.name = name
    
    const { error } = await supabase
      .from('wallet_roles')
      .update(updateData)
      .eq('wallet_address', normalizedAddress)
    
    return !error
  } else {
    // Insert new role
    const { error } = await supabase
      .from('wallet_roles')
      .insert({
        wallet_address: normalizedAddress,
        role,
        is_owner: isOwnerRole,
        name: name || null,
      })
    
    return !error
  }
}

// Remove role from a wallet
export async function removeRole(walletAddress: string): Promise<boolean> {
  if (!supabase) return false
  const normalizedAddress = walletAddress.toLowerCase()
  
  // Don't allow removing owner's role
  const isOwnerWallet = await isOwner(normalizedAddress)
  if (isOwnerWallet) return false
  
  const { error } = await supabase
    .from('wallet_roles')
    .delete()
    .eq('wallet_address', normalizedAddress)
  
  return !error
}

// Get all assigned wallets with their roles
export async function getAllAssignedWallets(): Promise<WalletRole[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('wallet_roles')
    .select('wallet_address, role, is_owner, name')
    .order('created_at', { ascending: true })
  
  if (error || !data) return []
  
  return data.map(row => ({
    address: row.wallet_address,
    role: row.role as Role,
    isOwner: row.is_owner,
    name: row.name || undefined,
  }))
}

// ============ ACCESS REQUESTS ============

// Submit a new access request
export async function submitAccessRequest(
  walletAddress: string, 
  name: string, 
  requestedRole: Role
): Promise<AccessRequest | null> {
  if (!supabase) return null
  const normalizedAddress = walletAddress.toLowerCase()
  
  // Check if there's already a pending request - delete it first
  await supabase
    .from('access_requests')
    .delete()
    .eq('wallet_address', normalizedAddress)
    .eq('status', 'pending')
  
  // Insert new request
  const { data, error } = await supabase
    .from('access_requests')
    .insert({
      wallet_address: normalizedAddress,
      name,
      requested_role: requestedRole,
      status: 'pending',
    })
    .select()
    .single()
  
  if (error || !data) return null
  
  return {
    id: data.id,
    walletAddress: data.wallet_address,
    name: data.name,
    requestedRole: data.requested_role as Role,
    status: data.status as 'pending' | 'approved' | 'declined',
    timestamp: data.created_at,
    reviewedAt: data.reviewed_at,
  }
}

// Get pending requests (for owner dashboard)
export async function getPendingRequests(): Promise<AccessRequest[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  
  if (error || !data) return []
  
  return data.map(row => ({
    id: row.id,
    walletAddress: row.wallet_address,
    name: row.name,
    requestedRole: row.requested_role as Role,
    status: row.status as 'pending' | 'approved' | 'declined',
    timestamp: row.created_at,
    reviewedAt: row.reviewed_at,
  }))
}

// Get request status for a wallet (most recent)
export async function getRequestStatus(walletAddress: string): Promise<AccessRequest | null> {
  if (!supabase) return null
  const normalizedAddress = walletAddress.toLowerCase()
  
  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .eq('wallet_address', normalizedAddress)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error || !data) return null
  
  return {
    id: data.id,
    walletAddress: data.wallet_address,
    name: data.name,
    requestedRole: data.requested_role as Role,
    status: data.status as 'pending' | 'approved' | 'declined',
    timestamp: data.created_at,
    reviewedAt: data.reviewed_at,
  }
}

// Check if wallet has a pending request
export async function hasPendingRequest(walletAddress: string): Promise<boolean> {
  if (!supabase) return false
  const normalizedAddress = walletAddress.toLowerCase()
  
  const { data, error } = await supabase
    .from('access_requests')
    .select('id')
    .eq('wallet_address', normalizedAddress)
    .eq('status', 'pending')
    .limit(1)
  
  if (error) return false
  return data && data.length > 0
}

// Approve access request
export async function approveAccessRequest(requestId: string, approvedRole?: Role): Promise<boolean> {
  if (!supabase) return false
  // Get the request first
  const { data: request, error: fetchError } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', requestId)
    .single()
  
  if (fetchError || !request) return false
  
  const roleToAssign = approvedRole || request.requested_role
  
  // Assign the role to the wallet (include name from request)
  const roleAssigned = await assignRole(request.wallet_address, roleToAssign as Role, request.name)
  if (!roleAssigned) return false
  
  // Update request status
  const { error } = await supabase
    .from('access_requests')
    .update({
      status: 'approved',
      requested_role: roleToAssign,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
  
  return !error
}

// Decline access request
export async function declineAccessRequest(requestId: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('access_requests')
    .update({
      status: 'declined',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
  
  return !error
}

// ============ REALTIME SUBSCRIPTIONS ============

// Subscribe to access request changes (for owner dashboard)
export function subscribeToAccessRequests(callback: (requests: AccessRequest[]) => void) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('access_requests_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'access_requests',
      },
      async () => {
        // Fetch updated pending requests
        const requests = await getPendingRequests()
        callback(requests)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// Subscribe to wallet role changes (for users waiting for approval)
export function subscribeToWalletRole(
  walletAddress: string, 
  callback: (role: Role | null) => void
) {
  if (!supabase) return () => {}
  const normalizedAddress = walletAddress.toLowerCase()
  
  const channel = supabase
    .channel(`wallet_role_${normalizedAddress}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wallet_roles',
        filter: `wallet_address=eq.${normalizedAddress}`,
      },
      async () => {
        const role = await getWalletRole(normalizedAddress)
        callback(role)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// Subscribe to request status changes for a specific wallet
export function subscribeToRequestStatus(
  walletAddress: string,
  callback: (request: AccessRequest | null) => void
) {
  if (!supabase) return () => {}
  const normalizedAddress = walletAddress.toLowerCase()
  
  const channel = supabase
    .channel(`request_status_${normalizedAddress}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'access_requests',
        filter: `wallet_address=eq.${normalizedAddress}`,
      },
      async () => {
        const status = await getRequestStatus(normalizedAddress)
        callback(status)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}
