create table public.articles (
  id bigserial not null,
  source text not null,
  group_name text null,
  url text not null,
  date text null,
  title text not null,
  text text null,
  categories text[] null,
  tags text[] null,
  lastmod text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  status text not null default 'queued'::text,
  decision text null,
  company text null,
  buyer text null,
  location_region text null,
  sector text[] null,
  amount text null,
  trigger_signal text[] null,
  solution text null,
  lead_score numeric(3, 1) null default 0.0,
  why_this_matters text null,
  location_country text null,
  outreach_angle text null,
  additional_details text null,
  processed_at timestamp with time zone null default now(),
  constraint articles_pkey primary key (id),
  constraint articles_url_key unique (url),
  constraint chk_articles_lead_score check (
    (
      (lead_score >= 0.0)
      and (lead_score <= 10.0)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_articles_source on public.articles using btree (source) TABLESPACE pg_default;
create index IF not exists idx_articles_date on public.articles using btree (date) TABLESPACE pg_default;
create index IF not exists idx_articles_url on public.articles using btree (url) TABLESPACE pg_default;
create index IF not exists idx_articles_status on public.articles using btree (status) TABLESPACE pg_default;
create index IF not exists idx_articles_decision on public.articles using btree (decision) TABLESPACE pg_default;
create index IF not exists idx_articles_lead_score on public.articles using btree (lead_score desc) TABLESPACE pg_default;
create index IF not exists idx_articles_sector_gin on public.articles using gin (sector) TABLESPACE pg_default;
create index IF not exists idx_articles_trigger_signal_gin on public.articles using gin (trigger_signal) TABLESPACE pg_default;
create index IF not exists idx_articles_processed_at on public.articles using btree (processed_at desc) TABLESPACE pg_default;

create trigger trg_articles_set_updated_at BEFORE
update on articles for EACH row
execute FUNCTION set_updated_at ();

-- RLS Policies for articles
alter table public.articles enable ROW level security;

-- Allow authenticated users to read all articles
create policy "Allow authenticated users to read articles" on public.articles
  for SELECT
  using (auth.role() = 'authenticated');

create table public.tags (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  color text not null default '#6B7280'::text,
  is_default boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint tags_pkey primary key (id),
  constraint tags_name_key unique (name)
) TABLESPACE pg_default;

-- Index for tags
create index IF not exists idx_tags_name on public.tags using btree (name) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_tags_is_default ON public.tags(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON public.tags(created_at DESC);

create trigger trg_tags_set_updated_at BEFORE
update on tags for EACH row
execute FUNCTION set_updated_at ();

-- Add Default Tags
INSERT INTO "public"."tags" ("name", "color", "is_default")
VALUES
    ('Call Now', '#EF4444', true),
    ('Watch', '#EAB308', true),
    ('Not Relevant', '#6B7280', true),
    ('To Be Actioned', '#EF4444', true),
    ('For Info', '#A855F7', true),
    ('Completed', '#0EA5E9', true);

-- RLS Policies for tags
alter table public.tags enable ROW level security;

-- Allow authenticated users to read all tags
create policy "Allow authenticated users to read tags" on public.tags
  for SELECT
  using (auth.role() = 'authenticated');

-- Allow authenticated users to insert tags
create policy "Allow authenticated users to insert tags" on public.tags
  for INSERT
  with CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update tags
create policy "Allow authenticated users to update tags" on public.tags
  for UPDATE
  using (auth.role() = 'authenticated');

-- Allow authenticated users to delete tags
create policy "Allow authenticated users to delete tags" on public.tags
  for DELETE
  using (auth.role() = 'authenticated');

create table public.article_tags (
  id uuid not null default extensions.uuid_generate_v4 (),
  article_id bigint not null,
  tag_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint article_tags_pkey primary key (id),
  constraint article_tags_article_id_tag_id_key unique (article_id, tag_id),
  constraint article_tags_article_id_fkey foreign KEY (article_id) references articles (id) on delete CASCADE,
  constraint article_tags_tag_id_fkey foreign KEY (tag_id) references tags (id) on delete CASCADE
) TABLESPACE pg_default;

-- Indexes for article_tags
create index IF not exists idx_article_tags_article_id on public.article_tags using btree (article_id) TABLESPACE pg_default;
create index IF not exists idx_article_tags_tag_id on public.article_tags using btree (tag_id) TABLESPACE pg_default;

-- RLS Policies for article_tags
alter table public.article_tags enable ROW level security;

-- Allow authenticated users to read all article_tags
create policy "Allow authenticated users to read article_tags" on public.article_tags
  for SELECT
  using (auth.role() = 'authenticated');

-- Allow authenticated users to insert article_tags
create policy "Allow authenticated users to insert article_tags" on public.article_tags
  for INSERT
  with CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update article_tags
create policy "Allow authenticated users to update article_tags" on public.article_tags
  for UPDATE
  using (auth.role() = 'authenticated');

-- Allow authenticated users to delete article_tags
create policy "Allow authenticated users to delete article_tags" on public.article_tags
  for DELETE
  using (auth.role() = 'authenticated');

-- Notes table (one-to-one relationship with articles)
create table public.notes (
  id uuid not null default extensions.uuid_generate_v4 (),
  article_id bigint not null,
  content text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint notes_pkey primary key (id),
  constraint notes_article_id_key unique (article_id),
  constraint notes_article_id_fkey foreign KEY (article_id) references articles (id) on delete CASCADE
) TABLESPACE pg_default;

-- Indexes for notes
create index IF not exists idx_notes_article_id on public.notes using btree (article_id) TABLESPACE pg_default;
create index IF not exists idx_notes_created_at on public.notes using btree (created_at desc) TABLESPACE pg_default;
create index IF not exists idx_notes_updated_at on public.notes using btree (updated_at desc) TABLESPACE pg_default;

create trigger trg_notes_set_updated_at BEFORE
update on notes for EACH row
execute FUNCTION set_updated_at ();

-- RLS Policies for notes
alter table public.notes enable ROW level security;

-- Allow authenticated users to read all notes
create policy "Allow authenticated users to read notes" on public.notes
  for SELECT
  using (auth.role() = 'authenticated');

-- Allow authenticated users to insert notes
create policy "Allow authenticated users to insert notes" on public.notes
  for INSERT
  with CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update notes
create policy "Allow authenticated users to update notes" on public.notes
  for UPDATE
  using (auth.role() = 'authenticated');

-- Allow authenticated users to delete notes
create policy "Allow authenticated users to delete notes" on public.notes
  for DELETE
  using (auth.role() = 'authenticated');