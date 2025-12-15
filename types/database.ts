export interface Article {
  id: string
  source: string
  group_name: string
  url: string
  date: string
  title: string
  updated_at: string
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

export interface KPIStats {
  total_today: number
  high_priority_today: number
  awaiting_review: number
  weekly_added: number
}

export interface Filters {
  search: string
  minScore: number | null
  maxScore: number | null
  sectors: string[]
  triggers: string[]
  country: string | null
  tagIds: string[]
  groups: string[]
}
