# SoloSearch-DailyIntelligence

A comprehensive daily intelligence dashboard for monitoring NHS & Digital market signals, built with Next.js 16 and Supabase.

## Overview

SoloSearch-DailyIntelligence is an enterprise-grade dashboard application that helps teams track and manage business leads from processed articles. The system provides real-time insights into market signals with collaborative features for team-based lead management.

### Key Capabilities

- **Real-Time KPI Monitoring**: Live metrics on daily signals, high-priority leads, review status, and weekly trends
- **Advanced Multi-Filter System**: Powerful filtering by company name, lead score, sector, trigger signals, geography, group, and custom tags
- **Collaborative Tagging**: Shared tag system enabling team-wide lead categorization and prioritization
- **AI-Powered Lead Scoring**: Intelligent 1-10 scoring system with actionable insights
- **Excel Export**: One-click export of filtered leads with full data and color-coded priority indicators
- **Secure Authentication**: Email/password authentication with Row Level Security (RLS)

## Features

### Dashboard Components

#### KPI Cards
- **Processed Today**: Total articles processed in the last 24 hours
- **High Priority Today**: Leads with score ≥ 8 processed today
- **Awaiting Review**: Untagged articles requiring team action
- **Weekly Added**: Total articles processed in the last 7 days

#### Advanced Filtering System
- **Free-Text Search**: Search across company names, titles, and AI-generated insights
- **Lead Score Ranges**: 
  - 8-10 (Immediate action required)
  - 6-7 (High interest)
  - 4-5 (Monitor)
  - 1-3 (Low priority)
- **Multi-Select Filters**:
  - Sectors (industry categories)
  - Trigger signals (market events)
  - Countries (geographic location)
  - Groups (article sources)
  - Tags (team categorization)
- **Clear Filters**: One-click reset of all active filters

#### Shared Tagging System
- **Default Tags**: Pre-configured with "Not Relevant", "Watch", and "Call Now"
- **Custom Tags**: Create tags with custom names and colors
- **Team Collaboration**: All tags are shared across users - when one user tags an article, everyone sees it
- **Quick Assignment**: Click-to-tag interface with visual color indicators
- **Tag Management**: Full CRUD operations for custom tags

#### Intelligent Data Table
- **Sortable Columns**: Click to sort by any field
- **Pagination**: 20 articles per page with navigation
- **Visual Priority Indicators**:
  - 🔥 8-10: Critical - immediate outreach required
  - ✅ 6-7: High interest - follow up soon
  - 👀 4-5: Monitor - watch for opportunities
- **Comprehensive Article Details**:
  - Company name and buyer information
  - Group/source classification
  - Sector tags (multiple)
  - Trigger signals (multiple)
  - AI-generated insights (Why This Matters, Outreach Angle, Additional Details)
  - Deal amount and solution type
  - Location (region and country)
  - Publication and processing dates
  - Source URL (clickable)
  - Assigned tags

### Excel Export Functionality
- Exports filtered lead data with all columns
- Color-coded rows based on lead score
- Clickable URLs for article sources
- Includes all tags assigned to articles
- Auto-filter enabled on all columns
- Filename includes export date

## Tech Stack

- **Framework**: Next.js 16.0.10 (App Router with React Server Components)
- **Runtime**: React 19.2.3
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (@supabase/ssr 0.8.0)
- **Styling**: Tailwind CSS 4.1.18 with tailwindcss-animate
- **UI Components**: shadcn/ui with Radix UI primitives
- **Data Fetching**: SWR 2.3.7 (client-side caching and revalidation)
- **Excel Generation**: ExcelJS 4.4.0
- **Language**: TypeScript 5
- **Icons**: Lucide React 0.561.0
- **Utilities**: clsx, tailwind-merge, class-variance-authority
- **Analytics**: Vercel Analytics 1.6.1

## Getting Started

### Prerequisites

- Node.js 18+ with npm or pnpm
- A Supabase project (free tier available)
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SoloSearch-DailyIntelligence
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these values:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon/public key

### 4. Database Setup

The application requires specific database tables and RLS policies. Run the SQL script in your Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the contents of `scripts/001-create-tables.sql`
4. Execute the script

**What this creates:**
- `articles` table with full schema (if not exists)
- `tags` table with default tags
- `article_tags` junction table for many-to-many relationships
- Indexes for optimal query performance
- Row Level Security (RLS) policies for all tables
- Triggers for automatic timestamp updates

**Important:** Your existing `articles` table should have a `status` column. Only articles with `status = 'processed'` will appear in the dashboard.

### 5. Create User Accounts

In your Supabase dashboard:
1. Navigate to Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Users can now log in at `/login`

### 6. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to the login page.

### 7. Test the Setup

1. Log in with a created user account
2. Verify the dashboard loads
3. Check that articles appear (ensure you have articles with `status = 'processed'`)
4. Test filtering and tagging features
5. Try exporting data to Excel

## Project Structure

```
SoloSearch-DailyIntelligence/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   └── dashboard/
│   │       ├── data/
│   │       │   └── route.ts       # Main data API (articles, tags, KPIs, filter options)
│   │       ├── tags/
│   │       │   └── route.ts       # Tag CRUD operations (GET, POST, PUT, DELETE)
│   │       └── article-tags/
│   │           └── route.ts       # Article-tag assignments (POST, DELETE)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts           # Supabase auth callback handler
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard page (server component)
│   ├── login/
│   │   └── page.tsx               # Login page with email/password
│   ├── layout.tsx                 # Root layout with global styles
│   ├── page.tsx                   # Landing page (redirects to /login)
│   └── globals.css                # Global CSS with Tailwind directives
│
├── components/
│   ├── dashboard/                 # Dashboard-specific components
│   │   ├── dashboard-client.tsx   # Main client component with SWR data fetching
│   │   ├── dashboard-header.tsx   # Header with logout and export buttons
│   │   ├── filters-bar.tsx        # Advanced filtering UI (search, dropdowns)
│   │   ├── kpi-cards.tsx          # 4 KPI cards with icons
│   │   ├── leads-table.tsx        # Paginated table with tag assignment
│   │   └── tags-manager.tsx       # Tag creation, editing, deletion dialog
│   └── ui/                        # shadcn/ui components (Radix primitives)
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       └── table.tsx
│
├── lib/                           # Utility libraries
│   ├── supabase/                  # Supabase client configurations
│   │   ├── client.ts              # Browser client (singleton pattern)
│   │   ├── server.ts              # Server client (for Server Components)
│   │   └── middleware.ts          # Auth middleware for session management
│   ├── export.ts                  # Excel export with ExcelJS (color-coding, formatting)
│   └── utils.ts                   # Utility functions (cn for className merging)
│
├── types/
│   └── database.ts                # TypeScript interfaces (Article, Tag, KPIStats, Filters)
│
├── scripts/
│   └── 001-create-tables.sql      # Database schema creation with RLS policies
│
├── middleware.ts                  # Next.js middleware for auth protection
├── next.config.mjs                # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── postcss.config.mjs             # PostCSS configuration
├── components.json                # shadcn/ui configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## Architecture

### Data Flow

1. **Server-Side Authentication**
   - `middleware.ts` → Checks auth on every request
   - Redirects unauthenticated users to `/login`
   - Redirects authenticated users from `/login` to `/dashboard`

2. **Dashboard Loading**
   - `app/dashboard/page.tsx` (Server Component) → Verifies user session
   - Renders `DashboardClient` with `userId` prop
   - Client component mounts and initializes

3. **Data Fetching**
   - `dashboard-client.tsx` → Uses SWR to fetch from `/api/dashboard/data`
   - API route (`app/api/dashboard/data/route.ts`) → Queries Supabase
   - Returns articles with nested tags, all available tags, KPIs, and filter options
   - SWR caches data and auto-revalidates

4. **Client-Side Filtering**
   - User interacts with `FiltersBar`
   - Filters applied in-memory (no API calls)
   - Table re-renders with filtered results

5. **Tag Operations**
   - Tag assignment → POST to `/api/dashboard/article-tags`
   - Tag removal → DELETE from `/api/dashboard/article-tags`
   - Create/edit/delete tags → POST/PUT/DELETE to `/api/dashboard/tags`
   - SWR automatically refetches data after mutations

6. **Excel Export**
   - Export button → `lib/export.ts` → ExcelJS
   - Generates `.xlsx` file in browser with all filtered data
   - Downloads automatically

## Database Schema

### Articles Table

Core table containing all article/lead data. Must exist before running setup scripts.

**Key Columns:**
```sql
id                  bigserial PRIMARY KEY
source              text                    -- Article source/publisher
group_name          text                    -- Article group/category
url                 text UNIQUE             -- Article URL
date                text                    -- Publication date
title               text                    -- Article title
company             text                    -- Target company name
buyer               text                    -- Buyer information
sector              text[]                  -- Array of industry sectors
amount              text                    -- Deal/contract amount
trigger_signal      text[]                  -- Array of market signals
solution            text                    -- Solution type
lead_score          numeric(3,1)            -- AI score (0.0-10.0)
why_this_matters    text                    -- AI insight
outreach_angle      text                    -- AI suggestion
additional_details  text                    -- AI context
location_region     text                    -- Geographic region
location_country    text                    -- Country code
status              text DEFAULT 'queued'   -- Processing status
updated_at          timestamp               -- Last update (auto-updated)
created_at          timestamp               -- Creation time
```

**Critical:** Only articles with `status = 'processed'` appear in the dashboard.

**Indexes:**
- `idx_articles_status` - For fast status filtering
- `idx_articles_lead_score` - For score-based queries (DESC)
- `idx_articles_sector_gin` - GIN index for array operations
- `idx_articles_trigger_signal_gin` - GIN index for signal queries
- `idx_articles_location_country` - For geographic filtering
- `idx_articles_created_at` - For date-based sorting

### Tags Table

Stores all available tags (default and custom).

**Schema:**
```sql
id          uuid PRIMARY KEY DEFAULT uuid_generate_v4()
name        text UNIQUE NOT NULL        -- Tag name
color       text DEFAULT '#6B7280'      -- Hex color code
is_default  boolean DEFAULT false       -- Protected system tags
created_at  timestamp DEFAULT now()
updated_at  timestamp DEFAULT now()
```

**Default Tags** (created by script):
- "Not Relevant" - `#6B7280` (gray)
- "Watch" - `#EAB308` (yellow)
- "Call Now" - `#EF4444` (red)

**Indexes:**
- `idx_tags_name` - For tag lookups
- `idx_tags_is_default` - For system tag queries
- `idx_tags_created_at` - For sorting

### Article_Tags Table

Junction table for many-to-many relationship between articles and tags.

**Schema:**
```sql
id          uuid PRIMARY KEY DEFAULT uuid_generate_v4()
article_id  bigint NOT NULL REFERENCES articles(id) ON DELETE CASCADE
tag_id      uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE
created_at  timestamp DEFAULT now()

UNIQUE(article_id, tag_id)  -- Prevent duplicate assignments
```

**Indexes:**
- `idx_article_tags_article_id` - For article queries
- `idx_article_tags_tag_id` - For tag queries

### Row Level Security (RLS)

All tables have RLS enabled with policies for authenticated users:

**Articles:**
- ✅ SELECT: All authenticated users can read

**Tags:**
- ✅ SELECT, INSERT, UPDATE, DELETE: All authenticated users

**Article_Tags:**
- ✅ SELECT, INSERT, UPDATE, DELETE: All authenticated users

This enables shared collaboration where all team members see the same data.

## API Routes

### GET `/api/dashboard/data`

**Purpose:** Main data endpoint for dashboard. Fetches everything needed in one request.

**Authentication:** Required (checks `auth.getUser()`)

**Returns:**
```typescript
{
  articles: Article[],      // All processed articles with nested tags
  tags: Tag[],              // All available tags
  kpis: KPIStats,           // Calculated metrics
  filterOptions: {          // Unique values for dropdowns
    sectors: string[],
    triggers: string[],
    countries: string[],
    groups: string[]
  }
}
```

**Query Logic:**
- Fetches articles where `status = 'processed'`
- Orders by `updated_at DESC`
- Includes nested tags via join
- Calculates KPIs based on `updated_at` timestamps
- Extracts unique filter values from results

---

### GET `/api/dashboard/tags`

**Purpose:** Fetch all tags (redundant with `/data`, but kept for flexibility)

**Authentication:** Required

**Returns:** `Tag[]`

---

### POST `/api/dashboard/tags`

**Purpose:** Create a new custom tag

**Authentication:** Required

**Body:**
```json
{
  "name": "Follow Up",
  "color": "#3B82F6"
}
```

**Returns:** Created `Tag` object

---

### PUT `/api/dashboard/tags`

**Purpose:** Update an existing tag

**Authentication:** Required

**Body:**
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "color": "#10B981"
}
```

**Returns:** Updated `Tag` object

---

### DELETE `/api/dashboard/tags?id={tagId}`

**Purpose:** Delete a tag (cascades to article_tags)

**Authentication:** Required

**Query Params:** `id` (tag UUID)

**Returns:** `{ success: true }`

**Note:** Deleting a tag removes all its assignments automatically via CASCADE.

---

### POST `/api/dashboard/article-tags`

**Purpose:** Assign a tag to an article

**Authentication:** Required

**Body:**
```json
{
  "article_id": "123",
  "tag_id": "uuid"
}
```

**Returns:** 
- `{ success: true }` - New assignment created
- `{ success: true, already_exists: true }` - Idempotent behavior

**Behavior:** If assignment already exists, returns success without error.

---

### DELETE `/api/dashboard/article-tags?article_id={id}&tag_id={uuid}`

**Purpose:** Remove a tag assignment from an article

**Authentication:** Required

**Query Params:**
- `article_id` (article ID)
- `tag_id` (tag UUID)

**Returns:** `{ success: true }`

## Key Libraries & Utilities

### `/lib/supabase/`

**`client.ts`** - Browser Supabase client
- Singleton pattern to reuse connection
- Uses `@supabase/ssr` for SSR compatibility
- Used in client components for API calls

**`server.ts`** - Server Supabase client
- For use in Server Components and API routes
- Handles cookies via Next.js `cookies()` function
- Proper cookie management for auth state

**`middleware.ts`** - Auth middleware
- Updates user session on each request
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login`
- Called by root `middleware.ts`

### `/lib/export.ts`

Excel export functionality using ExcelJS.

**Features:**
- Color-coded rows by lead score (red/green/blue backgrounds)
- Clickable URLs with hyperlinks
- Auto-filter on all columns
- Styled headers with dark background
- 19 columns of comprehensive data
- Filename includes export date

**Columns Exported:**
Score, Title, Company, Group, Buyer, Amount, Solution, Sectors, Signals, Why This Matters, Outreach Angle, Additional Details, Source, URL, Processed Date, Publication Date, Region, Country, Tags

### `/lib/utils.ts`

Utility functions for the app.

**`cn()`** - ClassName merger
- Combines `clsx` and `tailwind-merge`
- Properly merges Tailwind CSS classes
- Handles conditional classNames
- Used throughout components for dynamic styling

### `/types/database.ts`

TypeScript type definitions for the entire application.

**Key Interfaces:**
```typescript
Article {
  id, source, group_name, url, date, title, updated_at,
  company, buyer, sector[], amount, trigger_signal[],
  solution, lead_score, why_this_matters, outreach_angle,
  additional_details, location_region, location_country,
  tags?: Tag[]
}

Tag {
  id, name, color, is_default?
}

ArticleTag {
  id, article_id, tag_id
}

KPIStats {
  total_today, high_priority_today,
  awaiting_review, weekly_added
}

Filters {
  search, minScore, maxScore, sectors[],
  triggers[], country, tagIds[], groups[]
}
```

## Component Architecture

### Dashboard Components

**`dashboard-client.tsx`** - Main orchestrator
- Client component (uses hooks and state)
- SWR data fetching with `/api/dashboard/data`
- Manages filter state
- Client-side filtering logic (no API calls for filtering)
- Pagination state (20 per page)
- Passes data to child components

**`dashboard-header.tsx`** - Top navigation
- Sign out button with Supabase auth
- Export to Excel button
- Logo/title
- Responsive design

**`kpi-cards.tsx`** - Metrics display
- 4 cards: Processed Today, High Priority, Awaiting Review, Weekly
- Loading skeletons while fetching
- Icons from Lucide React
- Color-coded with Tailwind
- Responsive grid (2 cols mobile, 4 desktop)

**`filters-bar.tsx`** - Advanced filtering UI
- Free-text search input
- Score range dropdown (8-10, 6-7, 4-5, 1-3)
- Multi-select dropdowns (Sectors, Triggers, Countries, Groups, Tags)
- Clear filters button
- Active filter indicators
- Responsive layout

**`leads-table.tsx`** - Data table
- Paginated display (20 per page)
- Sortable columns (click headers)
- Tag assignment dropdown per row
- Priority indicators (🔥 ✅ 👀)
- Expandable rows for full details
- Clickable URLs
- Mobile-responsive with horizontal scroll

**`tags-manager.tsx`** - Tag CRUD dialog
- Modal dialog for tag management
- Create new tags with color picker
- Edit existing tags
- Delete tags (with confirmation)
- Prevents deletion of default tags
- Color swatches for visual selection

### UI Components (shadcn/ui)

Pre-built, customizable components from shadcn/ui:
- `alert`, `badge`, `button`, `card`, `dialog`
- `dropdown-menu`, `input`, `label`, `select`
- `skeleton`, `table`

All built on Radix UI primitives with Tailwind styling.

## Key Features Explained

### Shared Tagging System

Unlike per-user tagging, this system uses a **shared tagging approach**:
- When any user tags an article, all users see that tag
- Perfect for team collaboration
- Reduces duplicate work
- Everyone sees the same categorization

### Lead Scoring

Articles are scored 1-10 by AI:
- **8-10**: 🔥 Immediate outreach required
- **6-7**: ✅ High interest, follow up soon
- **4-5**: 👀 Monitor for future opportunities
- **1-3**: Low priority

### Filtering & Search

Powerful filtering options combine to narrow down results:
- **Free-text search**: Searches across company name, title, and AI insights (why_this_matters, outreach_angle, additional_details)
- **Score range filtering**: Select predefined ranges or view all
- **Multi-select filters**: Choose multiple sectors, signals, countries, groups, or tags
- **All filters work together**: Applied in-memory for instant results
- **No API calls**: Filtering happens client-side after initial data fetch
- **Active filter indicators**: Visual feedback on applied filters

### Export to Excel

Export functionality respects current filters and includes:
- All 19 columns of lead data
- Color-coded rows by lead score (High Priority = Red, High Interest = Green, Monitor = Blue)
- Clickable hyperlinks for article URLs
- All assigned tags per article
- Auto-filter enabled for easy sorting in Excel
- Filename format: `leads-export-YYYY-MM-DD.xlsx`
- One-click download directly from the browser

## Scripts

### `scripts/001-create-tables.sql`

Comprehensive database setup script that:
1. Creates `articles` table with full schema and constraints
2. Adds 9 indexes for optimal query performance (including GIN indexes for arrays)
3. Creates `tags` table with unique name constraint
4. Inserts 3 default tags (Not Relevant, Watch, Call Now)
5. Creates `article_tags` junction table with composite unique constraint
6. Adds 2 indexes for efficient tag queries
7. Enables Row Level Security on all tables
8. Creates RLS policies for authenticated users (read/write access)
9. Sets up automatic timestamp update triggers

**Usage:**
- Run once in Supabase SQL Editor
- Safe to re-run (uses `IF NOT EXISTS` clauses)
- Creates all necessary indexes and constraints
- Sets up complete RLS security model

## Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Push code to GitHub/GitLab/Bitbucket
   - Import project in Vercel dashboard
   - Select the repository

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Deploy**
   - Vercel auto-detects Next.js
   - Build command: `next build` (automatic)
   - Output directory: `.next` (automatic)
   - Click "Deploy"

4. **Automatic Deployments**
   - Push to main branch → auto-deploy to production
   - Push to other branches → preview deployments

### Other Platforms (Netlify, Railway, Render, etc.)

**Requirements:**
- Node.js 18+
- Environment variables configured

**Build Settings:**
```bash
Build Command: npm run build
Start Command: npm start
Output Directory: .next
```

**Environment Variables:**
- Add the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### "No articles showing up in dashboard"

**Possible causes:**
1. Articles don't have `status = 'processed'`
   - Check: `SELECT * FROM articles WHERE status = 'processed'`
   - Fix: Update articles: `UPDATE articles SET status = 'processed' WHERE ...`

2. RLS policies not applied
   - Verify: Check Supabase → Database → Policies
   - Fix: Run `scripts/001-create-tables.sql` again

3. User not authenticated
   - Check: Browser console for auth errors
   - Fix: Try logging out and back in

4. Date filtering issue
   - The dashboard filters by `updated_at` not `date`
   - Ensure `updated_at` is recent for "Today" stats

### "Can't add or remove tags"

**Possible causes:**
1. User not authenticated
   - Check browser console for 401 errors
   - Try refreshing the page

2. RLS policies missing on `article_tags` table
   - Run the complete SQL setup script

3. Network errors
   - Check browser Network tab
   - Verify Supabase URL is correct

### "Export button not working"

**Possible causes:**
1. No articles to export
   - Ensure filtered results exist

2. Browser blocking download
   - Check browser's download settings
   - Allow downloads from localhost/your domain

3. ExcelJS error
   - Check browser console for errors
   - Ensure all article data is valid

### "Authentication loop or can't log in"

**Possible causes:**
1. Invalid Supabase credentials in `.env.local`
   - Verify URL and anon key are correct
   - Restart dev server after changes

2. Cookies not being set
   - Check browser cookie settings
   - Try incognito/private mode

3. Middleware configuration issue
   - Check `middleware.ts` is in root directory
   - Verify `lib/supabase/middleware.ts` exists

### "API returns 500 errors"

**Possible causes:**
1. Database query errors
   - Check Supabase logs in dashboard
   - Verify table structures match expected schema

2. Missing environment variables
   - Ensure `.env.local` exists and is correct
   - Restart server after env changes

3. RLS policies too restrictive
   - Test queries directly in Supabase SQL Editor
   - Verify user has necessary permissions

### "Slow performance"

**Optimization tips:**
1. Ensure all database indexes are created
2. Limit number of articles (archive old ones)
3. Check Supabase performance metrics
4. Consider pagination adjustments (currently 20/page)
5. Use Vercel Edge Network for faster delivery

### Development Issues

**TypeScript errors:**
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` is correct
- Restart TypeScript server in VS Code

**Build errors:**
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules`: `rm -rf node_modules`
- Reinstall: `npm install`
- Try build again: `npm run build`

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

## Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server (requires build first)
npm start

# Run ESLint
npm run lint
```

### Adding New Features

**1. Database Changes**
   - Modify `scripts/001-create-tables.sql` if adding tables
   - Run updated script in Supabase SQL Editor
   - Update RLS policies if needed

**2. Update TypeScript Types**
   - Modify `types/database.ts` to match new schema
   - Add new interfaces as needed
   - Ensure all API responses are typed

**3. Create/Modify Components**
   - Add new components in `components/dashboard/` or `components/ui/`
   - Follow existing patterns (props interfaces, TypeScript)
   - Use Tailwind CSS for styling
   - Keep components small and focused

**4. Add API Endpoints**
   - Create new route in `app/api/`
   - Use Supabase server client from `lib/supabase/server`
   - Always check authentication
   - Return proper HTTP status codes
   - Handle errors gracefully

**5. Update Dashboard**
   - Modify `dashboard-client.tsx` for new data fetching
   - Update SWR configuration if needed
   - Add new filters to `filters-bar.tsx`
   - Update table columns in `leads-table.tsx`

### Adding New Filters

1. **Update Filter Type** in `types/database.ts`:
   ```typescript
   export interface Filters {
     // ... existing filters
     newFilter: string | null
   }
   ```

2. **Add Filter UI** in `components/dashboard/filters-bar.tsx`

3. **Update Filter Logic** in `dashboard-client.tsx`:
   ```typescript
   const applyFilters = (articles: Article[], filters: Filters) => {
     return articles.filter((article) => {
       // Add new filter condition
       if (filters.newFilter && article.field !== filters.newFilter) {
         return false
       }
       // ... rest of filters
     })
   }
   ```

### Adding New shadcn/ui Components

```bash
# Example: Add tooltip component
npx shadcn@latest add tooltip
```

Components are automatically added to `components/ui/` with Tailwind styling.

### Code Style Guidelines

- Use TypeScript for all files
- Use functional components with hooks
- Keep components small (< 300 lines)
- Extract reusable logic into custom hooks
- Use Tailwind CSS classes (no inline styles)
- Use `cn()` utility for conditional classes
- Always type component props
- Use async/await for API calls
- Handle loading and error states
- Add comments for complex logic

### Testing Locally

**Manual Testing Checklist:**
1. ✅ Login/logout flow
2. ✅ Dashboard loads with articles
3. ✅ All filters work correctly
4. ✅ Tag creation, editing, deletion
5. ✅ Tag assignment/removal on articles
6. ✅ Pagination works
7. ✅ Column sorting
8. ✅ Excel export with filters
9. ✅ Responsive design (mobile, tablet, desktop)
10. ✅ KPI cards show correct numbers
11. ✅ Error handling (try with no articles, network errors)
12. ✅ Multiple users see shared tags

**Test Data:**
Create test articles with:
- Various lead scores (1-10)
- Multiple sectors and trigger signals
- Different countries
- Mix of tagged and untagged
- Recent `updated_at` dates for "Today" stats

## Security

### Authentication & Authorization

- **Supabase Auth**: Email/password authentication with secure session management
- **HTTP-only cookies**: Session tokens stored securely, not accessible via JavaScript
- **Middleware protection**: All routes except `/login` and `/auth` require authentication
- **Server-side verification**: User session verified on every protected page load

### Row Level Security (RLS)

All database tables have RLS enabled:

**Articles Table:**
- ✅ SELECT: All authenticated users can read
- ❌ INSERT/UPDATE/DELETE: Blocked (read-only for dashboard users)
- Articles are managed by external processes, not via dashboard

**Tags Table:**
- ✅ SELECT, INSERT, UPDATE, DELETE: All authenticated users
- Enables collaborative tag management
- Default tags can be protected by frontend logic

**Article_Tags Table:**
- ✅ SELECT, INSERT, UPDATE, DELETE: All authenticated users
- Enables shared tagging across team
- Cascade deletes protect data integrity

### Data Protection

- **Environment variables**: Sensitive keys stored in `.env.local`, never committed to git
- **HTTPS enforced**: Use HTTPS in production (automatic on Vercel)
- **CORS**: Supabase configured to allow requests only from your domain
- **Rate limiting**: Consider adding rate limiting for API routes in production
- **Input validation**: All API endpoints validate input data
- **SQL injection protection**: Supabase client uses parameterized queries
- **XSS protection**: React automatically escapes user input

### Best Practices

1. **Rotate keys regularly**: Update Supabase keys periodically
2. **Monitor logs**: Check Supabase logs for suspicious activity
3. **Limit permissions**: Only grant necessary database permissions
4. **Use environment-specific keys**: Different keys for dev/staging/production
5. **Audit RLS policies**: Regularly review and test RLS policies
6. **Enable 2FA**: Enable two-factor authentication on Supabase account
7. **Backup data**: Regular database backups via Supabase

### Potential Enhancements

Consider implementing:
- Role-based access control (RBAC) for different user types
- Audit logging for tag changes
- Rate limiting on API endpoints
- IP whitelisting for sensitive operations
- Enhanced password requirements
- Session timeout configuration

## Performance Considerations

### Database Optimization

**Indexes** (automatically created by setup script):
- `idx_articles_status` - Fast filtering by processing status
- `idx_articles_lead_score` - Descending index for score-based sorting
- `idx_articles_sector_gin` - GIN index for array containment queries
- `idx_articles_trigger_signal_gin` - GIN index for signal array queries
- `idx_articles_location_country` - Geographic filtering
- `idx_articles_created_at` - Date-based sorting
- Composite indexes on junction table for fast tag lookups

**Query Optimization:**
- Single API call fetches all needed data (articles, tags, KPIs)
- Nested tag queries use Supabase's efficient join syntax
- Filters applied client-side (no repeated API calls)
- Pagination limits data transfer (20 items per page)

### Frontend Optimization

**SWR Caching:**
- Data cached in-memory after first fetch
- Automatic revalidation on window focus
- Manual revalidation after mutations (tag changes)
- Reduces unnecessary API calls

**React Performance:**
- Client-side filtering avoids re-fetching
- Memoized filter functions prevent unnecessary re-renders
- Pagination reduces DOM elements
- Skeleton loaders improve perceived performance

**Bundle Size:**
- Next.js automatic code splitting
- Components lazy-loaded as needed
- Tailwind CSS purges unused styles
- ExcelJS only loaded on export action

### Scaling Considerations

**Current limits:**
- Handles ~10,000 articles efficiently
- 20 articles per page keeps DOM lightweight
- In-memory filtering fast for < 50,000 records

**If scaling beyond:**
1. **Move filtering to backend** - Add query params to `/api/dashboard/data`
2. **Implement virtual scrolling** - Use libraries like `react-window`
3. **Add search indexing** - Use Supabase full-text search
4. **Implement caching layer** - Redis for frequently accessed data
5. **Paginate API responses** - Backend pagination with cursor-based navigation
6. **Optimize images** - Use Next.js Image component for logos/media
7. **Add CDN** - Vercel Edge Network or Cloudflare

### Monitoring

**Key Metrics to Track:**
- API response times
- Database query performance
- Frontend bundle size
- Core Web Vitals (LCP, FID, CLS)
- Error rates
- User session duration

**Tools:**
- Vercel Analytics (already integrated)
- Supabase Performance Dashboard
- Browser DevTools Performance tab
- Lighthouse audits

## Support & Contributing

### Getting Help

1. **Documentation**: Check this README first
2. **Supabase Logs**: View logs in Supabase Dashboard → Logs
3. **Browser Console**: Check for client-side errors (F12)
4. **Network Tab**: Inspect API calls for errors
5. **GitHub Issues**: Report bugs or request features

### Contributing Guidelines

**Before submitting a PR:**
1. Test all features locally
2. Ensure TypeScript compiles without errors (`npm run build`)
3. Run linter (`npm run lint`)
4. Update README if adding features
5. Update type definitions if changing data structures
6. Test with multiple user accounts if changing shared features

**Code Contribution Areas:**
- Bug fixes
- Performance improvements
- New filter types
- Additional export formats (CSV, PDF)
- UI/UX enhancements
- Mobile responsiveness improvements
- Accessibility improvements
- Documentation updates

### Project Roadmap

**Potential future features:**
- Advanced search with full-text queries
- Saved filter presets
- Email notifications for high-priority leads
- Bulk tag operations
- Article notes/comments
- User activity logs
- Custom KPI calculations
- API webhooks for integrations
- Dark mode
- Multi-language support

## Acknowledgments

Built with powerful open-source technologies:

- **[Next.js](https://nextjs.org/)** - React framework with App Router and Server Components
- **[React](https://react.dev/)** - UI library
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service with PostgreSQL and Auth
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[SWR](https://swr.vercel.app/)** - React Hooks for data fetching
- **[ExcelJS](https://github.com/exceljs/exceljs)** - Excel generation library
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
