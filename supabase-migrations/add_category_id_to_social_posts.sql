-- ============================================================
-- MIGRATION: Add category_id to social_posts
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add the missing column
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS category_id TEXT NULL;

-- 2. Add a helpful comment
COMMENT ON COLUMN social_posts.category_id IS 
  'Content category: educativo, bts, industria, producto, ventas, blog, etc.';

-- 3. Verify it worked
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'social_posts'
AND column_name = 'category_id';
