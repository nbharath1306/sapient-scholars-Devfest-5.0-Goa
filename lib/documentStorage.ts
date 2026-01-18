// Supabase-based storage for documents and access rules

import { supabase } from './supabase'
import type { Role } from './smartContract'

export type Sensitivity = 'public' | 'sensitive' | 'critical'
export type MaskType = 'none' | 'partial' | 'semantic' | 'denied'

export interface Document {
  id: string
  fieldKey: string
  name: string
  value: string
  sensitivity: Sensitivity
  createdAt: string
  updatedAt: string
}

export interface AccessRule {
  id: string
  documentId: string
  role: Role
  canView: boolean
  maskType: MaskType
}

export interface DocumentWithAccess extends Document {
  accessRules: Record<Role, { canView: boolean; maskType: MaskType }>
}

// ============ DOCUMENTS ============

// Get all documents
export async function getAllDocuments(): Promise<Document[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error || !data) return []
  
  return data.map(row => ({
    id: row.id,
    fieldKey: row.field_key,
    name: row.name,
    value: row.value,
    sensitivity: row.sensitivity as Sensitivity,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

// Get document by field key
export async function getDocumentByKey(fieldKey: string): Promise<Document | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('field_key', fieldKey)
    .single()
  
  if (error || !data) return null
  
  return {
    id: data.id,
    fieldKey: data.field_key,
    name: data.name,
    value: data.value,
    sensitivity: data.sensitivity as Sensitivity,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Create new document
export async function createDocument(
  fieldKey: string,
  name: string,
  value: string,
  sensitivity: Sensitivity
): Promise<Document | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('documents')
    .insert({
      field_key: fieldKey.toLowerCase().replace(/\s+/g, '_'),
      name,
      value,
      sensitivity,
    })
    .select()
    .single()
  
  if (error || !data) {
    console.error('Failed to create document:', error)
    return null
  }
  
  // Create default access rules for all roles
  const roles: Role[] = ['owner', 'founder', 'engineer', 'marketing']
  const defaultRules = roles.map(role => ({
    document_id: data.id,
    role,
    can_view: role === 'owner' || role === 'founder',
    mask_type: role === 'owner' || role === 'founder' ? 'none' : 'denied',
  }))
  
  await supabase.from('access_rules').insert(defaultRules)
  
  return {
    id: data.id,
    fieldKey: data.field_key,
    name: data.name,
    value: data.value,
    sensitivity: data.sensitivity as Sensitivity,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Update document
export async function updateDocument(
  id: string,
  updates: { name?: string; value?: string; sensitivity?: Sensitivity }
): Promise<boolean> {
  if (!supabase) return false
  const updateData: Record<string, string> = {}
  if (updates.name) updateData.name = updates.name
  if (updates.value) updateData.value = updates.value
  if (updates.sensitivity) updateData.sensitivity = updates.sensitivity
  
  const { error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id)
  
  return !error
}

// Delete document
export async function deleteDocument(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
  
  return !error
}

// ============ ACCESS RULES ============

// Get access rules for a document
export async function getAccessRules(documentId: string): Promise<AccessRule[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('access_rules')
    .select('*')
    .eq('document_id', documentId)
  
  if (error || !data) return []
  
  return data.map(row => ({
    id: row.id,
    documentId: row.document_id,
    role: row.role as Role,
    canView: row.can_view,
    maskType: row.mask_type as MaskType,
  }))
}

// Get access rule for specific document and role
export async function getAccessRule(documentId: string, role: Role): Promise<AccessRule | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('access_rules')
    .select('*')
    .eq('document_id', documentId)
    .eq('role', role)
    .single()
  
  if (error || !data) return null
  
  return {
    id: data.id,
    documentId: data.document_id,
    role: data.role as Role,
    canView: data.can_view,
    maskType: data.mask_type as MaskType,
  }
}

// Update access rule
export async function updateAccessRule(
  documentId: string,
  role: Role,
  canView: boolean,
  maskType: MaskType
): Promise<boolean> {
  if (!supabase) return false
  // Upsert the rule
  const { error } = await supabase
    .from('access_rules')
    .upsert({
      document_id: documentId,
      role,
      can_view: canView,
      mask_type: maskType,
    }, {
      onConflict: 'document_id,role'
    })
  
  return !error
}

// Get all documents with their access rules
export async function getDocumentsWithAccess(): Promise<DocumentWithAccess[]> {
  if (!supabase) return []
  const [documents, rules] = await Promise.all([
    getAllDocuments(),
    supabase.from('access_rules').select('*'),
  ])
  
  if (!rules.data) return documents.map(doc => ({
    ...doc,
    accessRules: {} as Record<Role, { canView: boolean; maskType: MaskType }>,
  }))
  
  const rulesMap = new Map<string, Record<Role, { canView: boolean; maskType: MaskType }>>()
  
  for (const rule of rules.data) {
    if (!rulesMap.has(rule.document_id)) {
      rulesMap.set(rule.document_id, {} as Record<Role, { canView: boolean; maskType: MaskType }>)
    }
    rulesMap.get(rule.document_id)![rule.role as Role] = {
      canView: rule.can_view,
      maskType: rule.mask_type as MaskType,
    }
  }
  
  return documents.map(doc => ({
    ...doc,
    accessRules: rulesMap.get(doc.id) || {} as Record<Role, { canView: boolean; maskType: MaskType }>,
  }))
}

// Get access policy for a role and document (used for rendering)
export async function getDocumentAccessForRole(role: Role): Promise<Map<string, { canView: boolean; maskType: MaskType }>> {
  if (!supabase) return new Map()
  const { data, error } = await supabase
    .from('access_rules')
    .select('document_id, can_view, mask_type, documents!inner(field_key)')
    .eq('role', role)
  
  if (error || !data) return new Map()
  
  const accessMap = new Map<string, { canView: boolean; maskType: MaskType }>()
  
  for (const rule of data) {
    const doc = rule.documents as unknown as { field_key: string }
    accessMap.set(doc.field_key, {
      canView: rule.can_view,
      maskType: rule.mask_type as MaskType,
    })
  }
  
  return accessMap
}

// ============ REALTIME SUBSCRIPTIONS ============

// Subscribe to document changes
export function subscribeToDocuments(callback: (documents: Document[]) => void) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('documents_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'documents',
      },
      async () => {
        const documents = await getAllDocuments()
        callback(documents)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// Subscribe to access rule changes
export function subscribeToAccessRules(callback: () => void) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('access_rules_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'access_rules',
      },
      () => {
        callback()
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}
