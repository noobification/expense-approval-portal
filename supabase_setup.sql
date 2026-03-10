-- Paste this entirely into the Supabase SQL Editor and click Run

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    sales_price REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create Line Items Table
CREATE TABLE IF NOT EXISTS line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES line_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    paid_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'In Progress',
    budget REAL NOT NULL DEFAULT 0,
    actual_cost REAL NOT NULL DEFAULT 0,
    amount_paid REAL NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    date_incurred TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_item_id UUID NOT NULL REFERENCES line_items(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT,
    url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    is_approved TEXT NOT NULL DEFAULT 'false',
    role TEXT NOT NULL DEFAULT 'User',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Updates for existing tables (in case they already existed from a previous run)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved TEXT NOT NULL DEFAULT 'false';
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
-- Ensure role has a default if it was created previously without one
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'User';
