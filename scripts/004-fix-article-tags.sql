-- ============================================
-- MIGRATION: Fix article_id type in article_tags
-- ============================================

-- Drop the existing article_tags table and recreate with BIGINT article_id
DROP TABLE IF EXISTS article_tags;

CREATE TABLE article_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id BIGINT NOT NULL,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, tag_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);

