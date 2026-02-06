-- =====================================================
-- 4Humans RentShield - Complete Database Schema
-- =====================================================
-- This script creates ALL database objects from scratch
-- Run this in a new Supabase project or after dropping all tables
-- =====================================================

-- =====================================================
-- STEP 1: DROP EXISTING TABLES (if rebuilding)
-- =====================================================
DROP TABLE IF EXISTS dao_votes CASCADE;
DROP TABLE IF EXISTS ai_verdicts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- STEP 2: CREATE TABLES
-- =====================================================

-- Profiles table (extends Supabase Auth users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'tenant' CHECK (role IN ('tenant', 'landlord', 'dao')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table (rental properties)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    unit_number TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    property_type TEXT CHECK (property_type IN ('apartment', 'house', 'condo', 'townhouse', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues table (tenant-reported problems)
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    landlord_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('maintenance', 'safety', 'pest', 'noise', 'lease-violation', 'utilities', 'security-deposit', 'other')),
    severity INTEGER DEFAULT 5 CHECK (severity >= 1 AND severity <= 10),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-review', 'under-investigation', 'escalated', 'resolved', 'dismissed')),
    description TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence table (uploaded files/photos)
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    acf_valid BOOLEAN DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table (discussion on issues)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Verdicts table (AI analysis results)
CREATE TABLE ai_verdicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    verdict TEXT NOT NULL CHECK (verdict IN ('legitimate', 'likely-legitimate', 'inconclusive', 'likely-fraudulent', 'fraudulent')),
    confidence NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
    reasoning TEXT,
    tenant_score INTEGER CHECK (tenant_score >= 0 AND tenant_score <= 100),
    landlord_score INTEGER CHECK (landlord_score >= 0 AND landlord_score <= 100),
    evidence_analysis JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAO Votes table (community voting on escalated issues)
CREATE TABLE dao_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('favor-tenant', 'favor-landlord', 'abstain', 'needs-more-info')),
    weight NUMERIC(10,2) DEFAULT 1.0,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (issue_id, voter_id)
);

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_issues_reporter ON issues(reporter_id);
CREATE INDEX idx_issues_landlord ON issues(landlord_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_created ON issues(created_at DESC);
CREATE INDEX idx_comments_issue ON comments(issue_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_evidence_issue ON evidence(issue_id);
CREATE INDEX idx_ai_verdicts_issue ON ai_verdicts(issue_id);
CREATE INDEX idx_dao_votes_issue ON dao_votes(issue_id);
CREATE INDEX idx_properties_owner ON properties(owner_id);

-- =====================================================
-- STEP 4: CREATE FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_verdicts_updated_at
    BEFORE UPDATE ON ai_verdicts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dao_votes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: CREATE RLS POLICIES
-- =====================================================

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable" ON profiles
    FOR SELECT USING (true);

-- PROPERTIES POLICIES
CREATE POLICY "Owners can manage their properties" ON properties
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Properties are viewable by related users" ON properties
    FOR SELECT USING (true);

-- ISSUES POLICIES
CREATE POLICY "Anyone can view issues" ON issues
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create issues" ON issues
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters can update own issues" ON issues
    FOR UPDATE USING (auth.uid() = reporter_id);

CREATE POLICY "Reporters can delete own issues" ON issues
    FOR DELETE USING (auth.uid() = reporter_id);

-- EVIDENCE POLICIES
CREATE POLICY "Anyone can view evidence" ON evidence
    FOR SELECT USING (true);

CREATE POLICY "Issue reporters can add evidence" ON evidence
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM issues 
            WHERE issues.id = issue_id 
            AND issues.reporter_id = auth.uid()
        )
    );

-- COMMENTS POLICIES
CREATE POLICY "Anyone can view comments" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = author_id);

-- AI VERDICTS POLICIES
CREATE POLICY "Anyone can view AI verdicts" ON ai_verdicts
    FOR SELECT USING (true);

-- DAO VOTES POLICIES
CREATE POLICY "DAO members can view votes" ON dao_votes
    FOR SELECT USING (true);

CREATE POLICY "DAO members can vote" ON dao_votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'dao'
        )
    );

-- =====================================================
-- STEP 7: CREATE STORAGE BUCKET FOR EVIDENCE
-- =====================================================
-- Note: Storage buckets must be created via Supabase Dashboard
-- OR run these commands if you have access:

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('evidence', 'evidence', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies for evidence bucket (run in Dashboard > Storage > Policies)
-- Allow authenticated users to upload:
-- Policy name: "Authenticated users can upload evidence"
-- Allowed operation: INSERT
-- Policy definition: (auth.role() = 'authenticated')

-- Allow public read access:
-- Policy name: "Public can view evidence"
-- Allowed operation: SELECT
-- Policy definition: true

-- =====================================================
-- COMPLETE! Your database is ready.
-- =====================================================

-- VERIFICATION: Check all tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
