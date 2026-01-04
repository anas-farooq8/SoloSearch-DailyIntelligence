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

### Dashboard Components

#### 1. KPI Cards
Four real-time metrics calculated using your local timezone:
- **Processed Today**: Total articles processed in the last 24 hours
- **High Priority Today**: Critical leads (score ≥ 8) processed today
- **Awaiting Review**: Untagged articles requiring team action
- **Weekly Added**: Total articles processed in the last 7 days

#### 2. Advanced Filtering System
Comprehensive filtering with persistent state:
- **Free-Text Search**: Search across titles, companies, and AI-generated insights (Why This Matters, Outreach Angle, Additional Details)
- **Lead Score Range Slider**: Dual-handle slider for precise score filtering (5-10)
- **Sector Group Filter**: Quick filter for Health/Med sectors, Others, or All (defaults to Health/Med on load)
- **Multi-Select Filters**:
  - **Sectors**: Industry categories (Healthcare, Medical Technology, etc.)
  - **Trigger Signals**: Market events (Contract Award, Funding Round, Product Launch, etc.)
  - **Countries**: Geographic location
  - **Groups**: Article sources (NHS Contracts, Startup Funding & Grants, HealthTech Media Coverage)
  - **Tags**: Custom team tags
- **Clear All**: One-click reset of all active filters

#### 3. Intelligent Data Table
Feature-rich article table with:
- **Sortable Columns**: Score, Date, Company, Group, Location (empty values pushed to end)
- **Pagination**: 50 articles per page with persistent page state (stored in localStorage)
- **Visual Priority Indicators**:
  - 🔴 **8-10**: Immediate outreach required
  - 🟢 **6-7**: High interest - follow up soon
  - 🟡 **4-5**: Monitor for opportunities
- **Comprehensive Details**:
  - Company name, buyer information, and solution type
  - Sector tags (multiple, color-coded badges)
  - Trigger signals (multiple, color-coded badges)
  - Deal amount and location (region + country)
  - AI insights with formatted sections
  - Publication date and processing timestamp
  - Clickable source URLs
  - Assigned tags with quick add/remove

#### 4. Shared Tagging System
Collaborative tagging with full CRUD operations:
- **Default Tags**: Pre-configured "Not Relevant", "Watch", "Call Now" (cannot be deleted)
- **Custom Tags**: Create unlimited custom tags with 20 color options
- **Team-Wide Sharing**: All users see the same tags - perfect for team collaboration
- **Quick Assignment**: Click to add/remove tags with visual loading indicators
- **Tag Management**: Dedicated UI for creating, editing, and deleting custom tags
- **Visual Feedback**: Color-coded badges with optimistic UI updates

#### 5. Notes System
Add context and team communication:
- **One Note Per Article**: Single note field for each article
- **Create/Edit/Delete**: Full CRUD operations with loading states
- **Persistent Storage**: Notes saved to database and visible to all team members
- **Rich Text Support**: Format notes with line breaks and structure

#### 6. View Switcher
Organize your workflow with dual views:
- **Active View**: Shows all articles except those tagged "Not Relevant" (default)
- **Hidden View**: Shows only articles tagged "Not Relevant"
- **Article Counts**: Real-time count badges for each view
- **Separate Filtering**: Filters apply independently to each view

#### 7. Article Detail Dialog
Full article information in a modal:
- Complete AI insights with formatted sections
- All metadata (sectors, triggers, location, dates, etc.)
- Tag management interface
- Notes editor with save/cancel/delete actions
- External link to original source

### Excel Export Functionality
Professional Excel exports with:
- All filtered article data (respects current filters)
- Color-coded rows based on lead score (red, green, amber)
- Clickable hyperlinks for source URLs
- All tags displayed as comma-separated values
- Auto-filter enabled on all columns
- Professional formatting with bold headers
- Filename includes export timestamp
- 19 columns of comprehensive lead data

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

## 💡 Usage Guide

### Understanding the Dashboard

**KPIs** are calculated in real-time using your local timezone:
- **Processed Today**: Articles with `updated_at` in last 24 hours
- **High Priority Today**: Articles scored ≥8 processed today
- **Awaiting Review**: Articles without any tags assigned
- **Weekly Added**: Articles with `updated_at` in last 7 days

### Filtering Strategies

**For quick wins (high-value leads):**
1. Set score range to 8-10
2. Select "Health/Med" sector group
3. Filter by your target country
4. Review and tag as "Call Now"

**For long-term pipeline:**
1. Set score range to 6-7
2. Use sector filters to focus on specific industries
3. Tag as "Watch" for follow-up

**For research:**
1. Use free-text search for specific companies or keywords
2. Filter by trigger signals (e.g., "Funding Round", "Contract Award")
3. Export to Excel for detailed analysis

### Tagging Best Practices

**Default Tags:**
- **Not Relevant**: Move to Hidden view (out of sight, not deleted)
- **Watch**: Medium-term opportunities worth monitoring
- **Call Now**: Hot leads requiring immediate action

**Custom Tags:**
- Create tags for specific campaigns or team members
- Use colors to indicate priority or category
- Examples: "Contacted", "Proposal Sent", "Partner Opportunity", "Q1 2026", etc.

**Workflow:**
1. Review untagged articles (Awaiting Review count)
2. Tag irrelevant ones as "Not Relevant" to clear the queue
3. Tag high-value leads with "Call Now" and custom tags
4. Use "Watch" for leads that need nurturing

### Notes System

Add internal context to articles:
- Record contact attempts and outcomes
- Note key decision-makers or next steps
- Share insights discovered from research
- All team members see the same notes

### Excel Export

Export filtered data for:
- **Weekly reports**: Export high-priority leads for team review
- **CRM import**: Export with relevant columns for bulk import
- **Analysis**: Use Excel's pivot tables and formulas
- **Archiving**: Keep historical snapshots of leads

**Tip:** Apply filters before exporting to get exactly the data you need.

### View Management

- **Active View** (default): Shows actionable leads (excludes "Not Relevant" tagged articles)
- **Hidden View**: Shows archived articles (only "Not Relevant" tagged)
- Switch between views to keep your workspace clean while retaining data

## 🔧 Configuration

### Customizing Default Filters

Edit [`components/dashboard/dashboard-client.tsx`](components/dashboard/dashboard-client.tsx):

```typescript
// Change default sector group (line ~139)
setFilters((prev) => ({ ...prev, sectorGroup: 'health' })) // Options: 'health', 'others', 'all', null
```

### Customizing Pagination

Edit [`components/dashboard/dashboard-client.tsx`](components/dashboard/dashboard-client.tsx) and [`components/dashboard/leads-table.tsx`](components/dashboard/leads-table.tsx):

```typescript
// Change page size (default: 50)
const pageSize = 50 // Change to desired number
```

### Adding Custom Tag Colors

Edit [`components/dashboard/tags-manager.tsx`](components/dashboard/tags-manager.tsx):

```typescript
const colorOptions = [
  "#EF4444", // Red
  // ... add more hex colors
]
```

### Customizing Group Names

Edit [`components/dashboard/leads-table.tsx`](components/dashboard/leads-table.tsx):

```typescript
const GROUP_MAPPING: Record<string, string> = {
  "1": "NHS Contracts",
  "2": "Startup Funding & Grants",
  "3": "HealthTech Media Coverage",
  // Add more mappings
}
```

### Modifying Excel Export Columns

Edit [`lib/export.ts`](lib/export.ts) to add/remove columns or change formatting.

## 🤖 n8n Workflow Integration

The project includes an n8n workflow (`workflow/article-process.json`) for automated article processing:

### Workflow Steps

1. **Schedule Trigger**: Runs hourly (configurable)
2. **Fetch Articles**: Gets up to 20 articles with `status = 'queued'` from Supabase
3. **AI Processing**: 
   - Uses source-specific prompts (configured in "Aggregate Prompts")
   - Analyzes article content for relevance
   - Extracts structured data (company, buyer, sector, triggers, etc.)
   - Generates lead score (1-10) and AI insights
4. **Filter**: Only processes articles with `decision = 'yes'` and `lead_score ≥ 5`
5. **Update Database**: Sets `status = 'processed'` and saves AI-extracted data

### Setting Up the Workflow

1. **Import to n8n**:
   - Open your n8n instance
   - Go to Workflows → Import from File
   - Select `workflow/article-process.json`

2. **Configure Supabase Credentials**:
   - Add Supabase credential in n8n
   - Use the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Configure AI Agent**:
   - Set up your AI provider (OpenAI, Anthropic, etc.)
   - Customize prompts in the "Aggregate Prompts" node for each source

4. **Activate Workflow**:
   - Enable the workflow
   - It will run hourly and process queued articles

### Adding Articles to Queue

Insert articles into the `articles` table with `status = 'queued'`:

```sql
INSERT INTO articles (source, url, title, text, categories, tags, status)
VALUES (
  'NHS Digital',
  'https://example.com/article',
  'Hospital Trust Awards Digital Contract',
  'Full article content...',
  ARRAY['Healthcare', 'Technology'],
  ARRAY['Contract', 'NHS'],
  'queued'
);
```

The n8n workflow will pick it up on the next run.

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

## 🔒 Security Considerations

### Row-Level Security (RLS)

All database tables use RLS policies:
- **Authenticated users only**: No public access
- **Read/Write access**: All authenticated users can read and write to all tables
- **Team-wide sharing**: No user-level isolation (designed for team collaboration)

If you need user-level isolation, modify RLS policies in the SQL script.

### Environment Variables

**Never commit `.env.local` to version control.**

Add to `.gitignore`:
```
.env*.local
```

### Authentication

- Uses Supabase Auth with secure HTTP-only cookies
- Session managed via middleware
- Automatic token refresh
- Logout clears all auth cookies

### Production Checklist

- [ ] Enable HTTPS (automatic with Vercel/Netlify)
- [ ] Set secure environment variables in deployment platform
- [ ] Review and tighten RLS policies if needed
- [ ] Enable Supabase email confirmations (optional)
- [ ] Set up database backups in Supabase
- [ ] Monitor logs for errors and security issues

## 📊 Performance Optimization

### Current Optimizations

1. **Single API Call**: All data fetched in one request (`/api/dashboard/data`)
2. **Client-Side Filtering**: No server round-trips for filter changes
3. **SWR Caching**: 10-second deduplication, prevents duplicate requests
4. **Memoized Calculations**: React `useMemo` for expensive operations
5. **Pagination**: Only 50 articles rendered at a time
6. **Optimistic UI**: Tag changes show immediately, then sync with server
7. **localStorage**: Page state persists across sessions

### Scaling Considerations

**For large datasets (>10,000 articles):**

1. **Implement server-side filtering**:
   - Move filtering logic to API route
   - Add pagination to API response
   - Only fetch current page of results

2. **Add database indexes** (already included):
   - `idx_articles_status` for status filtering
   - `idx_articles_lead_score` for score filtering
   - `idx_articles_sector_gin` for sector array searches
   - `idx_articles_trigger_signal_gin` for trigger array searches

3. **Consider virtual scrolling**:
   - Use libraries like `react-virtual` for large tables
   - Render only visible rows

4. **Implement lazy loading**:
   - Load article details on-demand
   - Defer loading of AI insights until modal open

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Use functional components with hooks
- Keep components focused and reusable
- Add comments for complex logic

### Testing Your Changes

Before submitting a PR:
- [ ] Test login/logout flow
- [ ] Test all filtering combinations
- [ ] Test tag creation, editing, deletion
- [ ] Test notes CRUD operations
- [ ] Test Excel export
- [ ] Test on mobile/tablet screen sizes
- [ ] Check browser console for errors
- [ ] Verify TypeScript compiles (`npm run build`)

## 📄 License

This project is proprietary software for Solo Search. All rights reserved.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing framework
- **Supabase Team**: For the backend-as-a-service platform
- **shadcn**: For the beautiful UI component library
- **Vercel**: For hosting and analytics
---

**Built with ❤️ for Solo Search**

*Last Updated: January 2026*

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
npx kill-port 3000
# Or run on different port: npm run dev -- -p 3001
```
