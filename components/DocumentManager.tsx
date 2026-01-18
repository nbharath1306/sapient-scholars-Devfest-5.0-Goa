'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMetaMask } from '@/app/providers'
import type { Role } from '@/lib/smartContract'
import {
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getAccessRules,
  updateAccessRule,
  subscribeToDocuments,
  type Document,
  type Sensitivity,
  type MaskType,
  type AccessRule,
} from '@/lib/documentStorage'
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Info,
  Zap,
} from 'lucide-react'

const sensitivityOptions: { id: Sensitivity; label: string; color: string; icon: React.ReactNode }[] = [
  { id: 'public', label: 'Public', color: 'text-green-500 bg-green-500/10', icon: <Eye className="w-3 h-3" /> },
  { id: 'sensitive', label: 'Sensitive', color: 'text-yellow-500 bg-yellow-500/10', icon: <AlertTriangle className="w-3 h-3" /> },
  { id: 'critical', label: 'Critical', color: 'text-red-500 bg-red-500/10', icon: <Zap className="w-3 h-3" /> },
]

const maskTypeOptions: { id: MaskType; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'none', label: 'Full Access', description: 'Can see everything', icon: <Eye className="w-3 h-3" /> },
  { id: 'partial', label: 'Partial Mask', description: 'First/last char visible', icon: <EyeOff className="w-3 h-3" /> },
  { id: 'semantic', label: 'AI Semantic', description: 'AI masks sensitive info', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'denied', label: 'Denied', description: 'No access', icon: <Lock className="w-3 h-3" /> },
]

const roles: Role[] = ['owner', 'founder', 'engineer', 'marketing']

export function DocumentManager() {
  const { currentRole, isOwner } = useMetaMask()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [editingDoc, setEditingDoc] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [newDoc, setNewDoc] = useState({ name: '', value: '', sensitivity: 'sensitive' as Sensitivity })
  const [editForm, setEditForm] = useState({ name: '', value: '', sensitivity: 'sensitive' as Sensitivity })
  
  // Access rules state
  const [accessRules, setAccessRules] = useState<Record<string, AccessRule[]>>({})
  const [editingRules, setEditingRules] = useState<Record<string, Record<Role, MaskType>>>({})

  const canManageDocuments = currentRole === 'owner' || currentRole === 'founder' || isOwner

  // Fetch documents
  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const docs = await getAllDocuments()
      setDocuments(docs)
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch access rules for a document
  const fetchAccessRules = async (docId: string) => {
    try {
      const rules = await getAccessRules(docId)
      setAccessRules(prev => ({ ...prev, [docId]: rules }))
      
      // Initialize editing rules
      const rulesMap: Record<Role, MaskType> = {} as Record<Role, MaskType>
      rules.forEach(rule => {
        rulesMap[rule.role] = rule.maskType
      })
      setEditingRules(prev => ({ ...prev, [docId]: rulesMap }))
    } catch (err) {
      console.error('Failed to fetch access rules:', err)
    }
  }

  useEffect(() => {
    fetchDocuments()
    
    // Subscribe to realtime updates
    const unsubscribe = subscribeToDocuments((docs) => {
      setDocuments(docs)
    })
    
    return () => unsubscribe()
  }, [])

  // Fetch access rules when expanding a document
  useEffect(() => {
    if (expandedDoc && !accessRules[expandedDoc]) {
      fetchAccessRules(expandedDoc)
    }
  }, [expandedDoc])

  const handleCreate = async () => {
    if (!newDoc.name.trim() || !newDoc.value.trim()) return
    
    setIsSaving(true)
    try {
      const doc = await createDocument(
        newDoc.name.trim(),
        newDoc.name.trim(),
        newDoc.value.trim(),
        newDoc.sensitivity
      )
      if (doc) {
        setNewDoc({ name: '', value: '', sensitivity: 'sensitive' })
        setIsCreating(false)
        await fetchDocuments()
      }
    } catch (err) {
      console.error('Failed to create document:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (docId: string) => {
    setIsSaving(true)
    try {
      await updateDocument(docId, {
        name: editForm.name,
        value: editForm.value,
        sensitivity: editForm.sensitivity,
      })
      setEditingDoc(null)
      await fetchDocuments()
    } catch (err) {
      console.error('Failed to update document:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      await deleteDocument(docId)
      await fetchDocuments()
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  const handleAccessRuleChange = async (docId: string, targetRole: Role, maskType: MaskType) => {
    setEditingRules(prev => ({
      ...prev,
      [docId]: { ...prev[docId], [targetRole]: maskType }
    }))
    
    const canView = maskType !== 'denied'
    await updateAccessRule(docId, targetRole, canView, maskType)
    await fetchAccessRules(docId)
  }

  const startEditing = (doc: Document) => {
    setEditForm({ name: doc.name, value: doc.value, sensitivity: doc.sensitivity })
    setEditingDoc(doc.id)
  }

  const getSensitivityInfo = (sensitivity: Sensitivity) => {
    return sensitivityOptions.find(s => s.id === sensitivity) || sensitivityOptions[1]
  }

  if (!canManageDocuments) {
    return null
  }

  return (
    <Card className="p-4 border-border/50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Document Management</h3>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} size="sm" variant="outline" className="gap-1">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Manage documents and set per-role access permissions.
        </p>

        {/* Create New Document */}
        {isCreating && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Document</span>
              <button onClick={() => setIsCreating(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <input
              type="text"
              value={newDoc.name}
              onChange={(e) => setNewDoc(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Document name"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            
            <textarea
              value={newDoc.value}
              onChange={(e) => setNewDoc(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Document content"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            
            <div className="flex gap-1">
              {sensitivityOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setNewDoc(prev => ({ ...prev, sensitivity: opt.id }))}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-md border transition-all flex items-center justify-center gap-1 ${
                    newDoc.sensitivity === opt.id
                      ? `border-current ${opt.color}`
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
            
            <Button onClick={handleCreate} size="sm" className="w-full" disabled={isSaving || !newDoc.name.trim()}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Document
            </Button>
          </div>
        )}

        {/* Documents List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-6 text-center">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No documents yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const sensitivityInfo = getSensitivityInfo(doc.sensitivity)
              const isExpanded = expandedDoc === doc.id
              const isEditing = editingDoc === doc.id
              const docRules = editingRules[doc.id] || {}
              
              return (
                <div key={doc.id} className="rounded-lg border border-border/50 overflow-hidden">
                  {/* Document Header */}
                  <div
                    className={`p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors ${
                      isExpanded ? 'bg-muted/20' : ''
                    }`}
                    onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 ${sensitivityInfo.color}`}>
                        {sensitivityInfo.icon}
                        {sensitivityInfo.label}
                      </div>
                      <span className="font-medium text-sm truncate">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-border/50">
                      {/* Edit Form or Value Display */}
                      {isEditing ? (
                        <div className="pt-3 space-y-2">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <textarea
                            value={editForm.value}
                            onChange={(e) => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                          />
                          <div className="flex gap-1">
                            {sensitivityOptions.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setEditForm(prev => ({ ...prev, sensitivity: opt.id }))}
                                className={`flex-1 px-2 py-1 text-xs rounded-md border transition-all flex items-center justify-center gap-1 ${
                                  editForm.sensitivity === opt.id
                                    ? `border-current ${opt.color}`
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                {opt.icon}
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdate(doc.id)} size="sm" className="flex-1" disabled={isSaving}>
                              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                              Save
                            </Button>
                            <Button onClick={() => setEditingDoc(null)} size="sm" variant="outline">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-3">
                          <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">{doc.value}</p>
                          <div className="flex gap-2 mt-2">
                            <Button onClick={() => startEditing(doc)} size="sm" variant="outline" className="gap-1">
                              <Pencil className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button onClick={() => handleDelete(doc.id)} size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Access Rules */}
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1 mb-2">
                          <Shield className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Access Rules</span>
                        </div>
                        
                        <div className="space-y-2">
                          {roles.map((targetRole) => (
                            <div key={targetRole} className="flex items-center justify-between gap-2">
                              <span className="text-xs capitalize w-20">{targetRole}</span>
                              <div className="flex gap-1 flex-1">
                                {maskTypeOptions.map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() => handleAccessRuleChange(doc.id, targetRole, opt.id)}
                                    title={opt.description}
                                    className={`flex-1 px-1.5 py-1 text-[10px] rounded border transition-all flex items-center justify-center gap-0.5 ${
                                      docRules[targetRole] === opt.id
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border hover:border-primary/50 text-muted-foreground'
                                    }`}
                                  >
                                    {opt.icon}
                                    <span className="hidden sm:inline">{opt.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-2 p-2 rounded bg-muted/30">
                          <div className="flex items-start gap-1">
                            <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-muted-foreground">
                              <strong>Full:</strong> See all • <strong>Partial:</strong> X-masked • <strong>Semantic:</strong> AI rewrites • <strong>Denied:</strong> Blocked
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
