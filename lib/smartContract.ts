import { ContractInteraction, AccessType, AccessTypeNames, Role as ContractRole, RoleNames } from './contractInteraction'

export type Role = 'founder' | 'engineer' | 'marketing'

export interface DocumentField {
  name: string
  value: string
  sensitivity: 'public' | 'sensitive' | 'critical'
}

export interface AccessPolicy {
  canView: boolean
  canMask: boolean
  canPartialView: boolean
  maskType?: 'partial' | 'semantic'
}

export const masterDocument = {
  revenue: { name: 'Revenue', value: '$5.2M', sensitivity: 'critical' as const },
  risks: { name: 'Risks', value: 'Lawsuit Pending', sensitivity: 'critical' as const },
  roadmap: { name: 'Roadmap', value: 'Launching V2 with AI capabilities, expanding to 15 countries', sensitivity: 'sensitive' as const },
  marketSize: { name: 'Market Size', value: '$2.8B TAM', sensitivity: 'sensitive' as const },
}

// Map AccessType to Role
export function accessTypeToRole(accessType: AccessType): Role {
  switch (accessType) {
    case AccessType.FULL:
      return 'founder'
    case AccessType.PARTIAL:
      return 'engineer'
    case AccessType.SEMANTIC:
      return 'marketing'
    default:
      return 'engineer'
  }
}

// Map field to index for blockchain
export function getFieldIndex(field: keyof typeof masterDocument): number {
  const fieldMap: Record<string, number> = {
    revenue: 0,
    risks: 1,
    roadmap: 2,
    marketSize: 3,
  }
  return fieldMap[field] ?? 0
}

// Local access rules for fallback (when contract not available)
export const accessRules: Record<Role, Record<string, AccessPolicy>> = {
  founder: {
    revenue: { canView: true, canMask: false },
    risks: { canView: true, canMask: false },
    roadmap: { canView: true, canMask: false },
    marketSize: { canView: true, canMask: false },
  },
  engineer: {
    revenue: { canView: true, canMask: true, canPartialView: true, maskType: 'partial' },
    risks: { canView: false, canMask: false, canPartialView: false },
    roadmap: { canView: true, canMask: false },
    marketSize: { canView: true, canMask: false },
  },
  marketing: {
    revenue: { canView: true, canMask: true, canPartialView: true, maskType: 'partial' },
    risks: { canView: true, canMask: true, canPartialView: false, maskType: 'semantic' },
    roadmap: { canView: true, canMask: false },
    marketSize: { canView: true, canMask: false },
  },
}

// Partial masking (simple redaction)
export function getPartialMask(value: string): string {
  const first = value.charAt(0)
  const last = value.charAt(value.length - 1)
  const middle = 'X'.repeat(Math.max(1, value.length - 2))
  return `${first}${middle}${last}`
}

// Get policy for a role and field
export function getAccessPolicy(role: Role, field: keyof typeof masterDocument): AccessPolicy {
  return accessRules[role][field] || { canView: false, canMask: false }
}

// Check what access level a role has for a field (local version)
export function checkAccess(role: Role, field: keyof typeof masterDocument): {
  type: 'full' | 'partial' | 'semantic' | 'denied'
  message: string
} {
  const policy = getAccessPolicy(role, field)

  if (!policy.canView) {
    return { type: 'denied', message: 'Access Denied - Insufficient permissions' }
  }

  if (policy.maskType === 'semantic') {
    return { type: 'semantic', message: 'Content will be semantically masked by AI' }
  }

  if (policy.maskType === 'partial') {
    return { type: 'partial', message: 'Content partially masked for security' }
  }

  return { type: 'full', message: 'Full access granted' }
}

// Verify access using blockchain contract
export async function verifyBlockchainAccess(
  contract: ContractInteraction | null,
  userAddress: string,
  field: keyof typeof masterDocument
): Promise<{ verified: boolean; accessType: 'full' | 'partial' | 'semantic' | 'denied' }> {
  if (!contract || !contract.isInitialized()) {
    console.log('[smartContract] Contract not initialized, using local verification')
    // Fallback to local verification
    const access = checkAccess('founder', field)
    return {
      verified: access.type !== 'denied',
      accessType: access.type,
    }
  }

  try {
    // Get field index
    const fieldIndex = getFieldIndex(field)

    // Call blockchain contract
    const accessTypeNum = await contract.checkFieldAccess(userAddress, fieldIndex)
    const accessType = accessTypeNum as AccessType

    // Simulate blockchain verification delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Log access to blockchain (emit event)
    try {
      await contract.verifyAndLogAccess(fieldIndex)
    } catch (error) {
      console.warn('[smartContract] Failed to log access event:', error)
    }

    const verified = accessType !== AccessType.DENIED

    return {
      verified,
      accessType: AccessTypeNames[accessType] as 'full' | 'partial' | 'semantic' | 'denied',
    }
  } catch (error) {
    console.error('[smartContract] Error verifying blockchain access:', error)
    // Fallback to local verification
    const access = checkAccess('founder', field)
    return {
      verified: access.type !== 'denied',
      accessType: access.type,
    }
  }
}
