-- ============================================
-- Complete Schema Migration for RentShield
-- ============================================
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- 1. ISSUES TABLE UPDATES
-- ============================================

-- Add missing columns to issues table
ALTER TABLE issues ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS landlord_id UUID REFERENCES profiles(id);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- IMPORTANT: Clean existing data BEFORE adding constraints
-- Update any invalid status values
UPDATE issues 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'in-review', 'under-investigation', 'resolved', 'dismissed', 'escalated')
   OR status IS NULL;

-- Update any invalid category values  
UPDATE issues 
SET category = 'other' 
WHERE category NOT IN ('maintenance', 'safety', 'pest', 'noise', 'lease-violation', 'utilities', 'security-deposit', 'other')
   OR category IS NULL;

-- Update severity to be in valid range
UPDATE issues SET severity = 5 WHERE severity IS NULL OR severity < 1 OR severity > 10;
UPDATE issues SET updated_at = created_at WHERE updated_at IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_issues_reporter_id ON issues(reporter_id);
CREATE INDEX IF NOT EXISTS idx_issues_landlord_id ON issues(landlord_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);

-- Add check constraints (drop first to avoid conflicts)
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_category_check;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_severity_check;

ALTER TABLE issues ADD CONSTRAINT issues_status_check 
CHECK (status IN ('pending', 'in-review', 'under-investigation', 'resolved', 'dismissed', 'escalated'));

ALTER TABLE issues ADD CONSTRAINT issues_category_check 
CHECK (category IN ('maintenance', 'safety', 'pest', 'noise', 'lease-violation', 'utilities', 'security-deposit', 'other'));

ALTER TABLE issues ADD CONSTRAINT issues_severity_check 
CHECK (severity >= 1 AND severity <= 10);

-- Trigger to auto-update updated_at
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


-- ============================================
-- 2. COMMENTS TABLE UPDATES
-- ============================================

-- Add updated_at if missing
ALTER TABLE comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 3. AI_VERDICTS TABLE UPDATES
-- ============================================

-- Ensure all required columns exist
ALTER TABLE ai_verdicts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE ai_verdicts ADD COLUMN IF NOT EXISTS reasoning TEXT;
ALTER TABLE ai_verdicts ADD COLUMN IF NOT EXISTS suggested_resolution TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_verdicts_issue_id ON ai_verdicts(issue_id);
CREATE INDEX IF NOT EXISTS idx_ai_verdicts_created_at ON ai_verdicts(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_ai_verdicts_updated_at ON ai_verdicts;
CREATE TRIGGER update_ai_verdicts_updated_at
    BEFORE UPDATE ON ai_verdicts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 4. DAO_VOTES TABLE UPDATES
-- ============================================

-- Ensure vote column has valid values
ALTER TABLE dao_votes DROP CONSTRAINT IF EXISTS dao_votes_vote_check;
ALTER TABLE dao_votes ADD CONSTRAINT dao_votes_vote_check 
CHECK (vote IN ('valid', 'invalid', 'needs-review'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dao_votes_issue_id ON dao_votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_dao_votes_juror_id ON dao_votes(juror_id);
CREATE INDEX IF NOT EXISTS idx_dao_votes_voted_at ON dao_votes(voted_at DESC);


-- ============================================
-- 5. EVIDENCE TABLE UPDATES
-- ============================================

-- Add additional metadata columns
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_evidence_issue_id ON evidence(issue_id);
CREATE INDEX IF NOT EXISTS idx_evidence_acf_valid ON evidence(acf_valid);


-- ============================================
-- 6. PROPERTIES TABLE UPDATES
-- ============================================

-- Add missing property columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_risk_score ON properties(risk_score);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 7. PROFILES TABLE UPDATES
-- ============================================

-- Ensure role has valid values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('tenant', 'landlord', 'dao'));

-- Add updated_at if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_users_id ON profiles(auth_users_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dao_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ISSUES: Tenants can view their own issues, landlords can view issues for their properties
DROP POLICY IF EXISTS "Tenants can view own issues" ON issues;
CREATE POLICY "Tenants can view own issues" ON issues
    FOR SELECT USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Tenants can create issues" ON issues;
CREATE POLICY "Tenants can create issues" ON issues
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Landlords can view issues for their properties" ON issues;
CREATE POLICY "Landlords can view issues for their properties" ON issues
    FOR SELECT USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "DAO members can view all issues" ON issues;
CREATE POLICY "DAO members can view all issues" ON issues
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'dao'
        )
    );

-- COMMENTS: Users can view comments on issues they're involved with
DROP POLICY IF EXISTS "Users can view comments on their issues" ON comments;
CREATE POLICY "Users can view comments on their issues" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues 
            WHERE issues.id = comments.issue_id 
            AND (issues.reporter_id = auth.uid() OR issues.landlord_id = auth.uid())
        ) OR auth.uid() = comments.author_id
    );

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- AI_VERDICTS: Readable by issue participants
DROP POLICY IF EXISTS "Users can view verdicts on their issues" ON ai_verdicts;
CREATE POLICY "Users can view verdicts on their issues" ON ai_verdicts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues 
            WHERE issues.id = ai_verdicts.issue_id 
            AND (issues.reporter_id = auth.uid() OR issues.landlord_id = auth.uid())
        )
    );

-- DAO_VOTES: DAO members can vote and view votes
DROP POLICY IF EXISTS "DAO members can vote" ON dao_votes;
CREATE POLICY "DAO members can vote" ON dao_votes
    FOR INSERT WITH CHECK (
        auth.uid() = juror_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'dao'
        )
    );

DROP POLICY IF EXISTS "DAO members can view votes" ON dao_votes;
CREATE POLICY "DAO members can view votes" ON dao_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'dao'
        )
    );

-- EVIDENCE: Viewable by issue participants
DROP POLICY IF EXISTS "Users can view evidence on their issues" ON evidence;
CREATE POLICY "Users can view evidence on their issues" ON evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues 
            WHERE issues.id = evidence.issue_id 
            AND (issues.reporter_id = auth.uid() OR issues.landlord_id = auth.uid())
        )
    );

-- PROPERTIES: Landlords can manage their properties
DROP POLICY IF EXISTS "Landlords can view own properties" ON properties;
CREATE POLICY "Landlords can view own properties" ON properties
    FOR SELECT USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlords can create properties" ON properties;
CREATE POLICY "Landlords can create properties" ON properties
    FOR INSERT WITH CHECK (auth.uid() = landlord_id);


-- ============================================
-- 9. VERIFY SCHEMA
-- ============================================

-- Show all tables and their columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('issues', 'comments', 'ai_verdicts', 'dao_votes', 'evidence', 'properties', 'profiles')
ORDER BY table_name, ordinal_position;
