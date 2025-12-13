-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on tags table
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Tags: All authenticated users can read tags
CREATE POLICY "Tags are viewable by authenticated users"
ON tags FOR SELECT
TO authenticated
USING (true);

-- Tags: Only authenticated users can insert non-default tags
CREATE POLICY "Authenticated users can create tags"
ON tags FOR INSERT
TO authenticated
WITH CHECK (is_default = FALSE);

-- Tags: Only authenticated users can update non-default tags
CREATE POLICY "Authenticated users can update non-default tags"
ON tags FOR UPDATE
TO authenticated
USING (is_default = FALSE);

-- Tags: Only authenticated users can delete non-default tags
CREATE POLICY "Authenticated users can delete non-default tags"
ON tags FOR DELETE
TO authenticated
USING (is_default = FALSE);

-- Enable RLS on article_tags table
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- Article Tags: All authenticated users can view all article tags (shared system)
CREATE POLICY "Authenticated users can view all article tags"
ON article_tags FOR SELECT
TO authenticated
USING (true);

-- Article Tags: All authenticated users can add tags to articles (shared system)
CREATE POLICY "Authenticated users can add article tags"
ON article_tags FOR INSERT
TO authenticated
WITH CHECK (true);

-- Article Tags: All authenticated users can remove tags from articles (shared system)
CREATE POLICY "Authenticated users can delete article tags"
ON article_tags FOR DELETE
TO authenticated
USING (true);

-- Enable RLS on articles table (assuming it exists)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Articles: All authenticated users can read processed articles
CREATE POLICY "Authenticated users can read processed articles"
ON articles FOR SELECT
TO authenticated
USING (status = 'processed');
