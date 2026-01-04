# SoloSearch-DailyIntelligence

An enterprise-grade daily intelligence dashboard for monitoring NHS & Digital market signals. Built to streamline lead qualification, team collaboration, and business opportunity tracking with AI-powered insights.

## 📊 Overview

SoloSearch-DailyIntelligence is a comprehensive lead management platform that helps teams discover, categorize, and act on business opportunities in the healthcare and digital sectors. The system processes articles from multiple sources, applies AI-driven lead scoring, and provides powerful filtering and collaboration tools for sales and business development teams.

### 🎯 Key Capabilities

- **Real-Time KPI Dashboard**: Live metrics on daily signals, high-priority leads, review status, and weekly trends (calculated in user's local timezone)
- **Advanced Multi-Filter System**: Powerful filtering by search terms, lead score ranges, sectors, trigger signals, geography, article groups, and custom tags
- **Collaborative Tagging**: Shared team-wide tag system for categorization and prioritization with customizable colors
- **AI-Powered Lead Scoring**: Intelligent 1-10 scoring system with contextual insights (Why This Matters, Outreach Angle, Additional Details)
- **Notes & Annotations**: One note per article for team collaboration and context sharing
- **Excel Export**: One-click export of filtered leads with color-coded priority indicators and full data
- **View Switcher**: Separate views for active leads and archived ("Not Relevant") articles
- **Secure Authentication**: Email/password authentication with Supabase Auth and Row-Level Security (RLS)
- **Automated Processing**: n8n workflow integration for continuous article ingestion and AI processing

## ✨ Features

- **Real-Time KPIs**: Dashboard with 4 metrics (Processed Today, High Priority, Awaiting Review, Weekly Added)
- **Advanced Filtering**: Free-text search, lead score range (5-10), sector groups, and multi-select filters (sectors, triggers, countries, groups, tags)
- **Intelligent Table**: Sortable columns, 50 items/page pagination, visual priority indicators (🔴 8-10, 🟢 6-7, 🟡 4-5)
- **Collaborative Tagging**: Shared team-wide tags with 3 defaults (Not Relevant, Watch, Call Now) + unlimited custom tags with 20 colors
- **Notes System**: One note per article for team collaboration
- **View Switcher**: Toggle between Active leads and Hidden (Not Relevant) articles
- **Article Details**: Full modal with AI insights, metadata, tags, notes, and source link
- **Excel Export**: One-click export with color-coded rows, clickable URLs, and all 19 columns

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16.0.10 (App Router with React Server Components)
- **React**: 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4.1.18 with custom CSS v4 syntax
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Fonts**: Geist Sans, Geist Mono, Source Serif 4 (Google Fonts)
- **Data Fetching**: SWR v2.3.7 for client-side caching and revalidation
- **Excel Export**: ExcelJS v4.4.0
- **Icons**: Lucide React v0.561.0
- **Analytics**: Vercel Analytics v1.6.1

### Backend
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth with email/password
- **Supabase SDK**: @supabase/supabase-js (latest) + @supabase/ssr v0.8.0
- **API**: Next.js API Routes with TypeScript
- **Middleware**: Custom auth middleware for route protection

### Development
- **Package Manager**: npm (compatible with pnpm)
- **Dev Server**: Next.js Dev Server with Fast Refresh
- **Build Tool**: Next.js with Turbopack support
- **PostCSS**: v8.5 with Tailwind v4 PostCSS plugin

### Automation
- **Workflow Engine**: n8n (article-process.json workflow)
- **AI Processing**: n8n AI Agent with source-specific prompts
- **Scheduling**: Hourly triggers for article processing

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher (v20+ recommended)
- **Package Manager**: npm or pnpm
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)
- **Git**: For version control

### 1. Clone the Repository

```bash
git clone https://github.com/anas-farooq8/SoloSearch-DailyIntelligence.git
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
- `articles` table with comprehensive schema and indexes
- `tags` table with 3 default tags (Not Relevant, Watch, Call Now)
- `article_tags` junction table for many-to-many relationships
- `notes` table for one-to-one article notes
- Row Level Security (RLS) policies for authenticated users
- Indexes for optimal query performance (GIN indexes for arrays, B-tree for common queries)
- Triggers for automatic `updated_at` timestamp management

**Schema Overview:**

**articles** table:
- Core fields: `id`, `source`, `group_name`, `url`, `date`, `title`, `company`, `buyer`
- AI fields: `lead_score` (0-10), `why_this_matters`, `outreach_angle`, `additional_details`
- Classification: `sector[]` (array), `trigger_signal[]` (array), `solution`, `amount`
- Location: `location_region`, `location_country`
- Processing: `status` (must be 'processed' to show in dashboard), `decision`, `updated_at`

**tags** table:
- `id` (uuid), `name` (unique), `color`, `is_default` (boolean)

**article_tags** table:
- Many-to-many relationship with unique constraint on `(article_id, tag_id)`
- Cascade deletes

**notes** table:
- One note per article with `article_id` unique constraint
- `content` (text), timestamps

**Important:** Only articles with `status = 'processed'` will appear in the dashboard.

### 5. Create User Accounts

In your Supabase dashboard:
1. Navigate to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter email and password
4. Repeat for additional team members
5. Users can now log in at `/login`

**Note:** This system uses email/password authentication. All authenticated users have access to all articles (team-wide sharing).

### 6. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to the login page.

### 7. Verify Setup

✅ **Checklist:**
1. Log in with a created user account
2. Dashboard loads without errors
3. Articles appear (ensure you have `status = 'processed'` articles)
4. KPI cards show data
5. Filters work (search, score range, sectors, etc.)
6. Can add/remove tags on articles
7. Can create custom tags
8. Can add/edit/delete notes
9. Excel export downloads successfully
10. View switcher toggles between Active and Hidden views

## 💡 Quick Start Tips

**Tagging Workflow:**
1. Review untagged articles (check Awaiting Review count)
2. Tag irrelevant ones as "Not Relevant" to hide them
3. Tag hot leads with "Call Now", others with "Watch"
4. Create custom tags for campaigns or team members

**Filtering Strategies:**
- Quick wins: Set score 8-10, select "Health/Med" sectors, tag as "Call Now"
- Long-term: Set score 6-7, use sector filters, tag as "Watch"
- Research: Use free-text search + trigger signals, export to Excel

## 🔧 Configuration

**Customize settings by editing:**
- Default filters: `components/dashboard/dashboard-client.tsx` (default sector group, page size)
- Tag colors: `components/dashboard/tags-manager.tsx` (colorOptions array)
- Group names: `components/dashboard/leads-table.tsx` (GROUP_MAPPING object)
- Excel export: `lib/export.ts` (add/remove columns, formatting)

## 🤖 n8n Workflow Integration

The project includes `workflow/article-process.json` for automated article processing:

**Workflow:** Runs hourly → Fetches articles with `status = 'queued'` → AI analyzes and scores → Updates articles to `status = 'processed'`

**Setup:**
1. Import `workflow/article-process.json` to your n8n instance
2. Add Supabase credentials (same as `.env.local`)
3. Configure AI provider (OpenAI, Anthropic, etc.)
4. Customize prompts for each source
5. Activate workflow

**Add articles:** Insert into `articles` table with `status = 'queued'`. The workflow processes articles with `decision = 'yes'` and `lead_score ≥ 5`.

## 📁 Project Structure

```
SoloSearch-DailyIntelligence/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Root redirect to /login
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── globals.css               # Global styles
│   ├── login/                    # Login page
│   │   └── page.tsx
│   ├── dashboard/                # Protected dashboard route
│   │   └── page.tsx              # SSR auth check + DashboardClient
│   ├── auth/
│   │   └── callback/             # OAuth callback handler
│   │       └── route.ts
│   └── api/                      # API routes
│       └── dashboard/
│           ├── data/             # Main data fetcher (GET)
│           ├── tags/             # Tag CRUD (GET, POST, PUT, DELETE)
│           ├── article-tags/     # Tag assignment (POST, DELETE)
│           └── notes/            # Notes CRUD (GET, POST, PUT, DELETE)
├── components/
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── dashboard-client.tsx  # Main dashboard logic
│   │   ├── dashboard-header.tsx  # Header with user menu
│   │   ├── filters-bar.tsx       # Filtering UI
│   │   ├── kpi-cards.tsx         # KPI display
│   │   ├── leads-table.tsx       # Article table with sorting
│   │   ├── tags-manager.tsx      # Tag management modal
│   │   └── how-it-works-guide.tsx # User guide
│   └── ui/                       # shadcn/ui components
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
├── lib/
│   ├── export.ts                 # Excel export functionality
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   └── supabase/
│       ├── client.ts             # Client-side Supabase client
│       └── server.ts             # Server-side Supabase client
├── types/
│   └── database.ts               # TypeScript types/interfaces
├── scripts/
│   └── 001-create-tables.sql     # Database schema setup
├── workflow/
│   └── article-process.json      # n8n workflow for AI processing
├── middleware.ts                 # Auth middleware for route protection
├── next.config.mjs               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration (v4 syntax)
├── postcss.config.mjs            # PostCSS configuration
├── components.json               # shadcn/ui configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🔒 Security

- **Row-Level Security (RLS)**: All tables require authentication. Team-wide sharing (no user-level isolation).
- **Environment Variables**: Never commit `.env.local` to version control. Add `.env*.local` to `.gitignore`.
- **Authentication**: Supabase Auth with HTTP-only cookies, automatic token refresh.
- **Production**: Enable HTTPS, set secure env vars, configure database backups, monitor logs.

## 📊 Performance

**Built-in optimizations:**
- Single API call for all data
- Client-side filtering (no server round-trips)
- SWR caching (10s deduplication)
- Pagination (50 articles/page)
- Optimistic UI for tag changes
- localStorage for page state

**For large datasets (>10k articles):** Consider server-side filtering, virtual scrolling, or lazy loading. Database indexes already included.

## � Troubleshooting

**No articles showing:**
- Ensure articles have `status = 'processed'`
- Verify RLS policies are applied
- Check `updated_at` is recent (KPIs use this field)

**Can't add/remove tags:**
- Check authentication (browser console for 401 errors)
- Verify RLS policies on `article_tags` table

**Export not working:**
- Ensure filtered results exist
- Check browser download settings

**Authentication issues:**
- Verify `.env.local` credentials are correct
- Clear browser cookies
- Restart dev server

**Build errors:**
- Clear `.next`: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`
- Rebuild: `npm run build`

## 📄 License

Proprietary software for Solo Search. All rights reserved.

---

**Built with ❤️ for [Solo Search](https://www.solosearch.co.uk/)** | *Last Updated: January 2026*
