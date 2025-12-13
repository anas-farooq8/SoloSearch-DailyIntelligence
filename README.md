# SoloSearch-DailyIntelligence

A comprehensive daily intelligence dashboard for monitoring NHS & Digital market signals, built with Next.js and Supabase.

## Overview

SoloSearch-DailyIntelligence is a dashboard application that helps teams track and manage business leads from processed articles. The system includes:

- **KPI Dashboard**: Real-time metrics on signals, priorities, and reviews
- **Advanced Filtering**: Search by company, score, sector, geography, and custom tags
- **Shared Tagging System**: Collaborate with your team using shared tags
- **Smart Scoring**: AI-powered lead scoring (1-10 scale)
- **Export Functionality**: Export leads to Excel
- **Authentication**: Secure email/password authentication via Supabase

## Features

### Dashboard Components

- **KPI Cards**
  - Total signals today
  - High priority leads (score ≥ 8) today
  - Leads awaiting review (untagged)
  - Weekly additions

- **Filters**
  - Lead score range (1-10)
  - Sector selection
  - Signal/trigger type
  - Geography/country code
  - Tag filtering
  - Company name search

- **Tagging System**
  - Default tags: Call Now, Watch, Not Relevant, Untagged
  - Create custom tags with colors
  - Shared across all users
  - Quick tag assignment

- **Data Table**
  - Sortable columns
  - Pagination (20 per page)
  - Score-based priority indicators:
    - 🔥 8-10: Immediate outreach
    - ✅ 6-7: High interest
    - 👀 4-5: Monitor
  - Article details: company, sector, signals, AI summary, amount, location

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: SWR
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Supabase project
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

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project settings.

### 4. Database Setup

**Important**: Follow the comprehensive database setup guide in `scripts/DATABASE_SETUP.md`

Quick steps:
1. Ensure your `articles` table exists with proper schema
2. Run the SQL scripts in order:
   - For fresh setup: `001`, `002`, `003`
   - For migration: `000`, then `001`, `002`, `003`

See [scripts/DATABASE_SETUP.md](./scripts/DATABASE_SETUP.md) for detailed instructions.

### 5. Create User Accounts

In your Supabase dashboard:
1. Go to Authentication → Users
2. Add users (email/password)
3. Users can now log in to the dashboard

### 6. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
SoloSearch-DailyIntelligence/
├── app/
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing/home page
├── components/
│   ├── dashboard/         # Dashboard components
│   │   ├── dashboard-client.tsx
│   │   ├── dashboard-header.tsx
│   │   ├── filters-bar.tsx
│   │   ├── kpi-cards.tsx
│   │   ├── leads-table.tsx
│   │   └── tags-manager.tsx
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   ├── export.ts          # Excel export functionality
│   └── utils.ts           # Utility functions
├── scripts/               # Database setup scripts
│   ├── DATABASE_SETUP.md  # Comprehensive setup guide
│   ├── 000-migration-cleanup.sql
│   ├── 001-create-tables.sql
│   ├── 002-rls-policies.sql
│   └── 003-functions.sql
└── types/
    └── database.ts        # TypeScript types
```

## Database Schema

### Articles Table (Expected)
Your existing `articles` table with fields:
- `id`, `source`, `group_name`, `url`, `date`
- `title`, `updated_at`, `company`, `buyer`
- `sector` (array), `amount`, `trigger_signal` (array)
- `solution`, `lead_score`, `ai_summary`
- `location_region`, `location_country`
- **`status`**: Must be `'processed'` to show in dashboard

### Tags Table (Created by scripts)
Stores all tags (default and custom)

### Article_Tags Table (Created by scripts)
Junction table linking articles to tags (shared across users)

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

Powerful filtering options:
- Free-text search by company name
- Score range filtering
- Multi-select filters for sectors and signals
- Country code filtering
- Tag-based filtering
- All filters work together

### Export to Excel

Export filtered leads with all details:
- All visible columns included
- Respects current filters
- Tags included in export
- One-click download

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Works on any Node.js hosting platform:
- Add environment variables
- Build: `npm run build`
- Start: `npm start`

## Troubleshooting

### "No articles showing up"
- Check articles have `status = 'processed'`
- Verify RLS policies are applied
- Confirm user is authenticated

### "Can't add tags"
- Ensure user is logged in
- Check RLS policies on `article_tags` table
- Verify authentication is working

### "Functions not working"
- Run all SQL scripts in order
- Check Supabase logs for errors
- Verify function signatures match app calls

See [DATABASE_SETUP.md](./scripts/DATABASE_SETUP.md) for more troubleshooting tips.

## Development

### Adding New Features

1. Update database schema if needed
2. Update TypeScript types in `types/database.ts`
3. Add/modify components in `components/`
4. Update Supabase functions if required

### Testing

Test manually:
1. Create test articles with `status = 'processed'`
2. Test all filters
3. Test tag creation and assignment
4. Test export functionality
5. Test with multiple users

## Security

- Row Level Security (RLS) enabled on all tables
- Only authenticated users can access data
- Default tags protected from deletion
- Article data is read-only for users

## Support & Contributing

For issues, questions, or contributions:
1. Check the [DATABASE_SETUP.md](./scripts/DATABASE_SETUP.md) guide
2. Review Supabase logs
3. Check browser console for errors
4. Verify RLS policies are correct

## License

[Your License Here]

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
