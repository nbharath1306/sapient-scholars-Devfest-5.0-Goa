-- Supabase SQL Schema for GateKeep
-- Run this in your Supabase SQL Editor

-- Table: wallet_roles
-- Stores wallet address to role mappings
CREATE TABLE IF NOT EXISTS wallet_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('founder', 'engineer', 'marketing')),
  is_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: access_requests
-- Stores access request records
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  name TEXT NOT NULL,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('founder', 'engineer', 'marketing')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wallet_roles_address ON wallet_roles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_access_requests_wallet ON access_requests(wallet_address);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);

-- Enable Row Level Security (RLS)
ALTER TABLE wallet_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallet_roles
-- Allow anyone to read wallet roles (needed to check access)
CREATE POLICY "Allow public read access to wallet_roles" 
  ON wallet_roles FOR SELECT 
  USING (true);

-- Allow anyone to insert (for first owner setup)
CREATE POLICY "Allow public insert to wallet_roles" 
  ON wallet_roles FOR INSERT 
  WITH CHECK (true);

-- Allow updates (owner will manage via app logic)
CREATE POLICY "Allow public update to wallet_roles" 
  ON wallet_roles FOR UPDATE 
  USING (true);

-- Allow deletes
CREATE POLICY "Allow public delete from wallet_roles" 
  ON wallet_roles FOR DELETE 
  USING (true);

-- RLS Policies for access_requests
-- Allow anyone to read access requests
CREATE POLICY "Allow public read access to access_requests" 
  ON access_requests FOR SELECT 
  USING (true);

-- Allow anyone to insert access requests
CREATE POLICY "Allow public insert to access_requests" 
  ON access_requests FOR INSERT 
  WITH CHECK (true);

-- Allow updates to access requests
CREATE POLICY "Allow public update to access_requests" 
  ON access_requests FOR UPDATE 
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for wallet_roles updated_at
DROP TRIGGER IF EXISTS update_wallet_roles_updated_at ON wallet_roles;
CREATE TRIGGER update_wallet_roles_updated_at
  BEFORE UPDATE ON wallet_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
