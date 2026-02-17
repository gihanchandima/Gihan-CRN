-- PostgreSQL migration: create accounts table

CREATE TABLE IF NOT EXISTS accounts (
  account_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT,
  size TEXT CHECK (size IN ('small', 'medium', 'enterprise')),
  website TEXT,
  phone TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_company_name ON accounts (company_name);
CREATE INDEX IF NOT EXISTS idx_accounts_owner_id ON accounts (owner_id);
CREATE INDEX IF NOT EXISTS idx_accounts_industry ON accounts (industry);
CREATE INDEX IF NOT EXISTS idx_accounts_size ON accounts (size);

CREATE OR REPLACE FUNCTION set_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_accounts_updated_at ON accounts;
CREATE TRIGGER trg_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION set_accounts_updated_at();
