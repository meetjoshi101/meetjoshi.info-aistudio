-- Migration: Add EditorJS Support
-- Description: Convert content fields from TEXT to JSONB for EditorJS block data
-- Date: 2026-01-09

-- =========================================
-- 1. ALTER PROJECTS TABLE
-- =========================================

-- Change content column to JSONB
ALTER TABLE projects
  ALTER COLUMN content TYPE JSONB
  USING CASE
    WHEN content IS NULL OR content = '' THEN NULL
    ELSE jsonb_build_object(
      'time', extract(epoch from NOW()) * 1000,
      'blocks', '[]'::jsonb,
      'version', '2.29.0'
    )
  END;

-- Add default value for new records
ALTER TABLE projects
  ALTER COLUMN content SET DEFAULT NULL;

-- =========================================
-- 2. ALTER BLOG_POSTS TABLE
-- =========================================

-- Change content column to JSONB
ALTER TABLE blog_posts
  ALTER COLUMN content TYPE JSONB
  USING CASE
    WHEN content IS NULL OR content = '' THEN NULL
    ELSE jsonb_build_object(
      'time', extract(epoch from NOW()) * 1000,
      'blocks', '[]'::jsonb,
      'version', '2.29.0'
    )
  END;

-- Add default value for new records
ALTER TABLE blog_posts
  ALTER COLUMN content SET DEFAULT NULL;

-- =========================================
-- 3. ADD VALIDATION FUNCTION
-- =========================================

-- Function to validate EditorJS format
CREATE OR REPLACE FUNCTION validate_editorjs_content(content JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if content has required structure
  RETURN (
    content IS NULL OR
    (
      content ? 'blocks' AND
      content ? 'version' AND
      jsonb_typeof(content->'blocks') = 'array'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =========================================
-- 4. ADD INDEXES FOR JSONB QUERIES (Optional)
-- =========================================

-- Create GIN index for JSONB content for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_content_gin ON projects USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_blog_posts_content_gin ON blog_posts USING GIN (content);

-- =========================================
-- MIGRATION COMPLETE
-- =========================================

-- To verify the migration:
-- SELECT id, slug, title, content FROM projects LIMIT 5;
-- SELECT id, slug, title, content FROM blog_posts LIMIT 5;
