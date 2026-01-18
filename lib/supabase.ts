import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DbWalletRole {
  id: string
  wallet_address: string
  role: 'founder' | 'engineer' | 'marketing'
  is_owner: boolean
  created_at: string
  updated_at: string
}

export interface DbAccessRequest {
  id: string
  wallet_address: string
  name: string
  requested_role: 'founder' | 'engineer' | 'marketing'
  status: 'pending' | 'approved' | 'declined'
  reviewed_at: string | null
  created_at: string
}

export interface DbAppSettings {
  id: string
  key: string
  value: string
  created_at: string
}
