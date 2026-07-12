# APPLYDASH

Track your job applications with style and precision. Organize your pipeline, measure your progress, and never miss a follow-up.

🚀 **Live App:** [https://applydash.vercel.app](https://applydash.vercel.app/)

![APPLYDASH Screenshot](https://github.com/user-attachments/assets/83ae6bde-a63e-4f5c-a7f7-643255ca4835)

## ✨ Features

### Dashboard

- **Statistics panel** — Total applications, response rate, interviews, offers, rejections, and overdue follow-ups
- **Quick filters** — All, This week, Interviewing, No response 14+ days, Follow-up due, Offers
- **Table view** — Editable AG Grid with sorting, filtering, and pagination
- **Kanban view** — Visual pipeline by status with drag-and-drop and inline status changes
- **Status colors** — Color-coded badges for every application stage
- **Clickable links** — Open job postings directly from the grid
- **Company & position suggestions** — Dropdown autocomplete from curated lists
- **Tags** — Comma-separated labels per job (e.g. `Frontend, Remote EU`)
- **Follow-up reminders** — `nextFollowUpDate` with visual alerts when due
- **Status history** — Automatic log of every status change per application
- **CSV export & import** — Back up or bulk-import your applications

### App experience

- **Light / dark / system theme** — Toggle in the navbar (persists in `localStorage`)
- **English & Spanish UI** — Language switcher (`EN` / `ES`) across landing and dashboard
- **Toast notifications** — Real-time feedback via Sonner on save, update, delete, and import
- **Responsive design** — Works on desktop and mobile; filters and view toggle stack cleanly on small screens; table scroll optimized for touch

### Authentication & data

- **User auth** — Supabase (register, login, password reset)
- **Admin panel** — Separate JWT-based admin login at `/admin`
- **Secure storage** — PostgreSQL via Prisma; jobs scoped per user

### Browser extension

Capture job postings from **LinkedIn**, **Indeed**, **InfoJobs**, and other sites directly into your dashboard. See [`extension/README.md`](extension/README.md) for install instructions.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (latest patched), React 19 |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Data grid | AG Grid Community v34 |
| ORM | Prisma 6 |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth + JWT (admin) |
| Validation | Zod + react-hook-form |
| Notifications | Sonner |
| Deployment | Vercel |

## 🏗️ Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Supabase project for authentication

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Pacoaldev/APPLYDASH.git
   cd APPLYDASH
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Site URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Database — Transaction pooler (port 6543) for serverless / production
   DATABASE_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres

   # Direct connection (port 5432) — used by Prisma migrations
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres

   # JWT Secret (Supabase → Settings → API → JWT Settings)
   JWT_SECRET=your_jwt_secret
   ```

   > ⚠️ Never commit `.env.local` to version control.

4. **Initialize the database**

   Generate the Prisma client:

   ```bash
   npx prisma generate
   ```

   Bootstrap tables (recommended for new setups):

   ```bash
   curl -X POST http://localhost:3000/api/migrate
   ```

   Or, if you use versioned Prisma migrations:

   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## 📊 Data model

### Job fields

| Field | Description |
|-------|-------------|
| `company` | Company name |
| `position` | Role / job title |
| `type` | `Remote`, `Office`, or `Hybrid` |
| `status` | Pipeline stage (Applied, Interview, Offer, Rejected, …) |
| `appliedDate` | Date you applied |
| `platform` | Where you found the job (LinkedIn, Indeed, …) |
| `applicationLink` | URL to the posting |
| `location` | Job location |
| `salary` | Salary info (free text) |
| `notes` | Personal notes |
| `tags` | Array of labels |
| `nextFollowUpDate` | Reminder date for follow-up — auto-set to `appliedDate + 7 days` when not specified |

### Status history

Every create and status change writes a row to `job_status_history` (`oldStatus`, `newStatus`, `changedAt`). View it from the dashboard via the **History** button on a selected row.

## 🧩 Browser extension

1. Open `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → select the `extension/` folder
3. Click **Reload** (↺) on the extension after any icon or code update
4. Log in to ApplyDash in the same browser
5. Open a job posting → click the extension icon → **Save to ApplyDash**

The extension pre-fills **ApplyDash URL** with the production URL (`https://applydash.vercel.app`) automatically — no manual configuration needed. For local development, change it to `http://localhost:3000`.

### Regenerating extension icons

The extension icons are generated from `public/applydashlogo.svg`. If you update the logo, regenerate them with:

```bash
node scripts/generate-icons.mjs
```

Then reload the extension in `chrome://extensions`.

## ☁️ Deploying to Vercel

Configured for Vercel — no custom build settings required.

### Environment variables

Add these in **Vercel → Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | Deployment URL (e.g. `https://applydash.vercel.app`) |
| `DATABASE_URL` | **Transaction pooler** URL (port `6543`) |
| `DIRECT_URL` | **Direct** connection URL (port `5432`) |
| `JWT_SECRET` | JWT secret from Supabase |

> ⚠️ Serverless functions must use the **transaction pooler** for `DATABASE_URL`, not the direct connection.

### Supabase auth URLs

In **Supabase → Authentication → URL Configuration**:

- **Site URL**: `https://applydash.vercel.app`
- **Redirect URLs**: `https://applydash.vercel.app/**`

### Post-deploy migration

After the first deploy, apply schema updates:

```bash
curl -X POST https://applydash.vercel.app/api/migrate
```

Or:

```bash
npm run migrate:deploy
```

## 🛠️ Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run check-env` | Validate required env vars |
| `npm run build:strict` | Check env + build |
| `npm run migrate:deploy` | Run Prisma migrations (production) |
| `npm run migrate:prod` | Production migration script |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma studio` | Open database browser |

## 📁 Project structure

```
APPLYDASH/
├── app/
│   ├── (auth)/           # Login, register, password reset
│   ├── (admin)/          # Admin auth & dashboard
│   ├── api/
│   │   ├── jobs/         # Extension & external job creation
│   │   └── migrate/      # Database bootstrap / schema updates
│   └── dashboard/        # Main user dashboard (server page + actions)
├── components/
│   ├── job-dashboard.tsx # Stats, filters, view toggle
│   ├── jobGrid.tsx       # AG Grid table
│   ├── job-kanban.tsx    # Kanban pipeline
│   ├── dashboard-stats.tsx
│   ├── quick-filters.tsx
│   ├── status-history-panel.tsx
│   ├── theme-provider.tsx
│   ├── locale-provider.tsx
│   └── ui/               # shadcn primitives
├── extension/            # Chrome extension (job capture)
├── lib/
│   ├── jobService.ts     # Job queries
│   ├── job-utils.ts      # Filters, stats, status colors
│   └── i18n/             # EN / ES translations
├── prisma/
│   └── schema.prisma     # User, Job, JobStatusHistory, Admin
├── data/
│   └── cellContents.ts   # Autocomplete lists (company, position, status)
├── types/
│   └── job.ts            # TypeScript interfaces
├── utils/supabase/       # Supabase clients & middleware
└── validation/           # Zod schemas
```

## 🎨 Theming & i18n

| Preference | Storage key | Options |
|------------|-------------|---------|
| Theme | `applydash-theme` | `light`, `dark`, `system` |
| Language | `applydash-locale` | `en`, `es` |

Theme uses CSS variables in `app/globals.css` (shadcn `.dark` class). Language strings live in `lib/i18n/translations.ts`.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE).

## 🙋‍♂️ Support

- [Open an issue](https://github.com/Pacoaldev/APPLYDASH/issues)

---

## 📝 Changelog

### July 2025 — Vercel migration

- **Migrated from DigitalOcean (Docker) to Vercel** — removed `output: standalone` and custom build scripts; Vercel now auto-detects Next.js
- **Next.js upgraded** to latest patched version (CVE-2025-66478 fix)
- **Supabase connection pooler** — `DATABASE_URL` now uses the Transaction pooler (port 6543) required for Vercel serverless; `DIRECT_URL` added for Prisma migrations
- **Email redirect fix** — `signUp` now passes `emailRedirectTo` using `NEXT_PUBLIC_SITE_URL` so confirmation emails link to the live domain instead of localhost
- **`nextFollowUpDate` auto-calculation** — new jobs get `appliedDate + 7 days` automatically in both the dashboard form and the browser extension API
- **Extension icons fixed** — regenerated as properly centered square PNGs from the SVG logo using `scripts/generate-icons.mjs`
- **Extension URL pre-filled** — production URL hardcoded as default so users don't need to type it manually
- **Mobile layout** — filter tabs and view toggle (Tabla/Kanban) now stack on separate rows; table container uses `touch-action: pan-y` to prevent accidental column drags on touch devices

---

Made with ❤️ for job seekers everywhere
