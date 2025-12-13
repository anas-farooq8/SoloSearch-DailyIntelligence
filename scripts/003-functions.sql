-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get articles with their tags for a user
CREATE OR REPLACE FUNCTION get_articles_with_tags(
  p_user_id UUID,
  p_page INTEGER DEFAULT 0,
  p_page_size INTEGER DEFAULT 20,
  p_search TEXT DEFAULT NULL,
  p_min_score INTEGER DEFAULT NULL,
  p_max_score INTEGER DEFAULT NULL,
  p_sectors TEXT[] DEFAULT NULL,
  p_triggers TEXT[] DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_tag_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source TEXT,
  group_name TEXT,
  url TEXT,
  date TIMESTAMPTZ,
  title TEXT,
  updated_at TIMESTAMPTZ,
  company TEXT,
  buyer TEXT,
  sector TEXT[],
  amount TEXT,
  trigger_signal TEXT[],
  solution TEXT,
  lead_score INTEGER,
  ai_summary TEXT,
  location_region TEXT,
  location_country TEXT,
  tags JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.source,
    a.group_name,
    a.url,
    a.date,
    a.title,
    a.updated_at,
    a.company,
    a.buyer,
    a.sector,
    a.amount,
    a.trigger_signal,
    a.solution,
    a.lead_score,
    a.ai_summary,
    a.location_region,
    a.location_country,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color))
        FROM article_tags at
        JOIN tags t ON t.id = at.tag_id
        WHERE at.article_id = a.id AND at.user_id = p_user_id
      ),
      '[]'::jsonb
    ) as tags
  FROM articles a
  WHERE a.status = 'processed'
    AND (p_search IS NULL OR a.company ILIKE '%' || p_search || '%')
    AND (p_min_score IS NULL OR a.lead_score >= p_min_score)
    AND (p_max_score IS NULL OR a.lead_score <= p_max_score)
    AND (p_sectors IS NULL OR a.sector && p_sectors)
    AND (p_triggers IS NULL OR a.trigger_signal && p_triggers)
    AND (p_country IS NULL OR a.location_country = p_country)
    AND (
      p_tag_ids IS NULL 
      OR EXISTS (
        SELECT 1 FROM article_tags at 
        WHERE at.article_id = a.id 
        AND at.user_id = p_user_id 
        AND at.tag_id = ANY(p_tag_ids)
      )
    )
  ORDER BY a.updated_at DESC
  LIMIT p_page_size
  OFFSET p_page * p_page_size;
END;
$$;

-- Function to count articles matching filters
CREATE OR REPLACE FUNCTION count_filtered_articles(
  p_user_id UUID,
  p_search TEXT DEFAULT NULL,
  p_min_score INTEGER DEFAULT NULL,
  p_max_score INTEGER DEFAULT NULL,
  p_sectors TEXT[] DEFAULT NULL,
  p_triggers TEXT[] DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_tag_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total
  FROM articles a
  WHERE a.status = 'processed'
    AND (p_search IS NULL OR a.company ILIKE '%' || p_search || '%')
    AND (p_min_score IS NULL OR a.lead_score >= p_min_score)
    AND (p_max_score IS NULL OR a.lead_score <= p_max_score)
    AND (p_sectors IS NULL OR a.sector && p_sectors)
    AND (p_triggers IS NULL OR a.trigger_signal && p_triggers)
    AND (p_country IS NULL OR a.location_country = p_country)
    AND (
      p_tag_ids IS NULL 
      OR EXISTS (
        SELECT 1 FROM article_tags at 
        WHERE at.article_id = a.id 
        AND at.user_id = p_user_id 
        AND at.tag_id = ANY(p_tag_ids)
      )
    );
  
  RETURN total;
END;
$$;

-- Function to get KPI stats
CREATE OR REPLACE FUNCTION get_dashboard_kpis(p_user_id UUID)
RETURNS TABLE (
  total_today INTEGER,
  high_priority_today INTEGER,
  awaiting_review INTEGER,
  weekly_added INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM articles WHERE status = 'processed' AND DATE(updated_at) = CURRENT_DATE) as total_today,
    (SELECT COUNT(*)::INTEGER FROM articles WHERE status = 'processed' AND DATE(updated_at) = CURRENT_DATE AND lead_score >= 8) as high_priority_today,
    (SELECT COUNT(*)::INTEGER FROM articles a WHERE status = 'processed' 
      AND NOT EXISTS (SELECT 1 FROM article_tags at WHERE at.article_id = a.id AND at.user_id = p_user_id)) as awaiting_review,
    (SELECT COUNT(*)::INTEGER FROM articles WHERE status = 'processed' AND updated_at >= NOW() - INTERVAL '7 days') as weekly_added;
END;
$$;

-- Function to get distinct sectors
CREATE OR REPLACE FUNCTION get_distinct_sectors()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT sector_item) INTO result
  FROM articles, UNNEST(sector) AS sector_item
  WHERE status = 'processed';
  
  RETURN result;
END;
$$;

-- Function to get distinct trigger signals
CREATE OR REPLACE FUNCTION get_distinct_triggers()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT trigger_item) INTO result
  FROM articles, UNNEST(trigger_signal) AS trigger_item
  WHERE status = 'processed';
  
  RETURN result;
END;
$$;

-- Function to get distinct countries
CREATE OR REPLACE FUNCTION get_distinct_countries()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT location_country) INTO result
  FROM articles
  WHERE status = 'processed' AND location_country IS NOT NULL;
  
  RETURN result;
END;
$$;
