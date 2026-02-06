-- Migration: Add missing columns to issues table
-- Run this in your Supabase SQL Editor

-- Add address column for property address
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add category column for issue type
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add severity column (1-10 scale)
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS severity INTEGER DEFAULT 5;

-- Add status column
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add description column
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add tenant_id foreign key to profiles
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES profiles(id);

-- Add landlord_id foreign key to profiles
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS landlord_id UUID REFERENCES profiles(id);

-- Add timestamps if they don't exist
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing rows to have valid values
UPDATE issues SET category = 'other' WHERE category IS NULL OR category = '';
UPDATE issues SET status = 'pending' WHERE status IS NULL OR status = '';
UPDATE issues SET severity = 5 WHERE severity IS NULL;

-- Now make category and status NOT NULL
ALTER TABLE issues ALTER COLUMN category SET NOT NULL;
ALTER TABLE issues ALTER COLUMN category SET DEFAULT 'other';
ALTER TABLE issues ALTER COLUMN status SET NOT NULL;
ALTER TABLE issues ALTER COLUMN status SET DEFAULT 'pending';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_issues_tenant_id ON issues(tenant_id);
CREATE INDEX IF NOT EXISTS idx_issues_landlord_id ON issues(landlord_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);

-- Add check constraints (drop first if they exist to avoid conflicts)
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_category_check;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_severity_check;

-- Add check constraint for status values
ALTER TABLE issues 
ADD CONSTRAINT issues_status_check 
CHECK (status IN ('pending', 'in-review', 'under-investigation', 'resolved', 'dismissed', 'escalated'));

-- Add check constraint for category values
ALTER TABLE issues 
ADD CONSTRAINT issues_category_check 
CHECK (category IN ('maintenance', 'safety', 'pest', 'noise', 'lease-violation', 'utilities', 'security-deposit', 'other'));

-- Add check constraint for severity range
ALTER TABLE issues 
ADD CONSTRAINT issues_severity_check 
CHECK (severity >= 1 AND severity <= 10);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'issues'
ORDER BY ordinal_position;

