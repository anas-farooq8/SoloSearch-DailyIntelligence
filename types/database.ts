export interface Article {
  id: string
  source: string
  group_name: string
  url: string
  date: string
  processed_at: string | null
  title: string
  company: string
  buyer: string
  sector: string[]
  amount: string
  trigger_signal: string[]
  solution: string
  lead_score: number
  why_this_matters: string | null
  outreach_angle: string | null
  additional_details: string | null
  location_region: string
  location_country: string
  tags?: Tag[]
  note?: Note | null
}

export interface Tag {
  id: string
  name: string
  color: string
  is_default?: boolean
}

export interface ArticleTag {
  id: string
  article_id: string
  tag_id: string
}

export interface Note {
  id: string
  article_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface KPIStats {
  total_today: number
  total_yesterday: number
  high_priority_today: number
  high_priority_yesterday: number
  awaiting_review: number
  weekly_added: number
  weekly_added_previous: number
}

export interface Filters {
  search: string
  minScore: number | null
  maxScore: number | null
  sectorGroup: 'all' | 'health' | 'others' | null
  sectors: string[]
  triggers: string[]
  sources: string[]
  tagIds: string[]
  groups: string[]
}
