# SoloSearch-DailyIntelligence

A comprehensive daily intelligence dashboard for monitoring NHS & Digital market signals, built with Next.js and Supabase.

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

- **Framework**: Next.js 16 with React 19
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with shadcn/ui components
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js with npm or pnpm
- A Supabase project (free tier available)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/anas-farooq8/SoloSearch-DailyIntelligence
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
npx kill-port 3000
# Or run on different port: npm run dev -- -p 3001
```
