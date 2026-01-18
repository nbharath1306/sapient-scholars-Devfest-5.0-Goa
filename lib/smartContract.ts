// Smart Contract Simulator - Blockchain Rules
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

// Smart Contract Rules (immutable blockchain rules)
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

// Check what access level a role has for a field
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

// Simulate blockchain verification
export async function verifyBlockchainAccess(
  userRole: Role,
  field: keyof typeof masterDocument,
  userAddress: string
): Promise<{ verified: boolean; accessType: 'full' | 'partial' | 'semantic' | 'denied' }> {
  // Simulate blockchain verification delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const access = checkAccess(userRole, field)
  const verified = access.type !== 'denied'

  return {
    verified,
    accessType: access.type,
  }
}
