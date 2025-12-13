-- ============================================
-- SoloSearch-DailyIntelligence Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6B7280',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tags
INSERT INTO tags (name, color, is_default) VALUES
  ('Call Now', '#EF4444', TRUE),
  ('Watch', '#EAB308', TRUE),
  ('Not Relevant', '#6B7280', TRUE),
  ('Untagged', '#9CA3AF', TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ARTICLE_TAGS JUNCTION TABLE
-- Tags are shared across all users - no user_id column
-- ============================================
CREATE TABLE IF NOT EXISTS article_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, tag_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);
