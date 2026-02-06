-- ============================================
-- RentShield Complete Database Schema
-- ============================================
-- WARNING: This will DELETE all existing data!
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ============================================
-- Drop in reverse order due to foreign key constraints

DROP TABLE IF EXISTS dao_votes CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS ai_verdicts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop the update trigger function if exists
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;


-- ============================================
-- STEP 2: CREATE PROFILES TABLE
-- ============================================
-- Links to Supabase Auth users

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord', 'dao')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);


-- ============================================
-- STEP 3: CREATE PROPERTIES TABLE
-- ============================================

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT,
    area TEXT,
    risk_score FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX idx_properties_risk_score ON properties(risk_score);


-- ============================================
-- STEP 4: CREATE ISSUES TABLE
-- ============================================

CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    landlord_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    address TEXT,
    category TEXT NOT NULL CHECK (category IN ('maintenance', 'safety', 'pest', 'noise', 'lease-violation', 'utilities', 'security-deposit', 'other')),
    severity INTEGER DEFAULT 5 CHECK (severity >= 1 AND severity <= 10),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-review', 'under-investigation', 'resolved', 'dismissed', 'escalated')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_issues_reporter_id ON issues(reporter_id);
CREATE INDEX idx_issues_landlord_id ON issues(landlord_id);
CREATE INDEX idx_issues_property_id ON issues(property_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);


-- ============================================
-- STEP 5: CREATE COMMENTS TABLE
-- ============================================

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_issue_id ON comments(issue_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);


-- ============================================
-- STEP 6: CREATE AI_VERDICTS TABLE
-- ============================================

CREATE TABLE ai_verdicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    confidence_score FLOAT DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    auto_category TEXT,
    raw_output JSONB,
    reasoning TEXT,
    suggested_resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_verdicts_issue_id ON ai_verdicts(issue_id);
CREATE INDEX idx_ai_verdicts_created_at ON ai_verdicts(created_at DESC);


-- ============================================
-- STEP 7: CREATE DAO_VOTES TABLE
-- ============================================

CREATE TABLE dao_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    juror_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('valid', 'invalid', 'needs-review')),
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Each juror can only vote once per issue
    UNIQUE(issue_id, juror_id)
);

-- Indexes
CREATE INDEX idx_dao_votes_issue_id ON dao_votes(issue_id);
CREATE INDEX idx_dao_votes_juror_id ON dao_votes(juror_id);
CREATE INDEX idx_dao_votes_voted_at ON dao_votes(voted_at DESC);


-- ============================================
-- STEP 8: CREATE EVIDENCE TABLE
-- ============================================

CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    exif_valid BOOLEAN DEFAULT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_evidence_issue_id ON evidence(issue_id);
CREATE INDEX idx_evidence_exif_valid ON evidence(exif_valid);


-- ============================================
-- STEP 9: CREATE AUTO-UPDATE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_verdicts_updated_at BEFORE UPDATE ON ai_verdicts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- STEP 10: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dao_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;


-- ============================================
-- STEP 11: CREATE RLS POLICIES
-- ============================================

-- PROFILES: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- PROPERTIES: Landlords manage their properties
CREATE POLICY "Landlords can view own properties" ON properties FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can insert properties" ON properties FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "Landlords can update own properties" ON properties FOR UPDATE USING (auth.uid() = landlord_id);

-- ISSUES: Complex access rules
CREATE POLICY "Tenants can view own issues" ON issues FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Tenants can create issues" ON issues FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Landlords can view their issues" ON issues FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "DAO can view all issues" ON issues FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'dao')
);

-- COMMENTS: Access based on issue involvement
CREATE POLICY "Issue participants can view comments" ON comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM issues WHERE id = comments.issue_id AND (reporter_id = auth.uid() OR landlord_id = auth.uid()))
    OR auth.uid() = author_id
);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- AI_VERDICTS: Viewable by issue participants
CREATE POLICY "Issue participants can view verdicts" ON ai_verdicts FOR SELECT USING (
    EXISTS (SELECT 1 FROM issues WHERE id = ai_verdicts.issue_id AND (reporter_id = auth.uid() OR landlord_id = auth.uid()))
);

-- DAO_VOTES: DAO members only
CREATE POLICY "DAO members can vote" ON dao_votes FOR INSERT WITH CHECK (
    auth.uid() = juror_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'dao')
);
CREATE POLICY "DAO members can view votes" ON dao_votes FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'dao')
);

-- EVIDENCE: Viewable by issue participants
CREATE POLICY "Issue participants can view evidence" ON evidence FOR SELECT USING (
    EXISTS (SELECT 1 FROM issues WHERE id = evidence.issue_id AND (reporter_id = auth.uid() OR landlord_id = auth.uid()))
);
CREATE POLICY "Issue reporters can upload evidence" ON evidence FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM issues WHERE id = evidence.issue_id AND reporter_id = auth.uid())
);


-- ============================================
-- STEP 12: VERIFY SCHEMA
-- ============================================

SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN ('profiles', 'properties', 'issues', 'comments', 'ai_verdicts', 'dao_votes', 'evidence')
ORDER BY t.table_name, c.ordinal_position;
