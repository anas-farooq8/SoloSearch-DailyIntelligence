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

-- Article Tags: Users can view their own tags
CREATE POLICY "Users can view their own article tags"
ON article_tags FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Article Tags: Users can insert their own tags
CREATE POLICY "Users can insert their own article tags"
ON article_tags FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Article Tags: Users can delete their own tags
CREATE POLICY "Users can delete their own article tags"
ON article_tags FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on articles table (assuming it exists)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Articles: All authenticated users can read processed articles
CREATE POLICY "Authenticated users can read processed articles"
ON articles FOR SELECT
TO authenticated
USING (status = 'processed');
