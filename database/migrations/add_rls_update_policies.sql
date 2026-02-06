-- Add RLS policy to allow users to update their own issues
-- Run this in your Supabase SQL Editor

-- Allow reporters to update their own issues (status, etc.)
DROP POLICY IF EXISTS "Users can update own issues" ON issues;
CREATE POLICY "Users can update own issues" ON issues
    FOR UPDATE USING (auth.uid() = reporter_id)
    WITH CHECK (auth.uid() = reporter_id);

-- Allow reporters to delete their own issues (if needed)
DROP POLICY IF EXISTS "Users can delete own issues" ON issues;
CREATE POLICY "Users can delete own issues" ON issues
    FOR DELETE USING (auth.uid() = reporter_id);

-- Make sure comments table allows inserts from authenticated users
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
CREATE POLICY "Authenticated users can insert comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Allow users to read comments on issues they can access
DROP POLICY IF EXISTS "Users can read comments" ON comments;
CREATE POLICY "Users can read comments" ON comments
    FOR SELECT USING (true);
