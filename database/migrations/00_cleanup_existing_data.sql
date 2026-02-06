-- ============================================
-- Step 1: Check and Fix Existing Data First
-- ============================================
-- Run this BEFORE the full migration to clean up data

-- Check what status values currently exist
SELECT DISTINCT status FROM issues;

-- Update any invalid status values to 'pending'
UPDATE issues 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'in-review', 'under-investigation', 'resolved', 'dismissed', 'escalated')
   OR status IS NULL;

-- Check what category values exist
SELECT DISTINCT category FROM issues;

-- Update any invalid category values to 'other'
UPDATE issues 
SET category = 'other' 
WHERE category NOT IN ('maintenance', 'safety', 'pest', 'noise', 'lease-violation', 'utilities', 'security-deposit', 'other')
   OR category IS NULL;

-- Verify the cleanup worked
SELECT 
    'Status values' as check_type,
    status, 
    COUNT(*) as count 
FROM issues 
GROUP BY status
UNION ALL
SELECT 
    'Category values',
    category, 
    COUNT(*) 
FROM issues 
GROUP BY category;
