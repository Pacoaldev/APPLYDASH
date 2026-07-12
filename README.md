# APPLYDASH

Track your job applications with style and precision. Watch your career opportunities come to life.

🚀 **Live App:** [https://applydash.vercel.app](https://applydash.vercel.app/)

![APPLYDASH Screenshot](https://github.com/user-attachments/assets/83ae6bde-a63e-4f5c-a7f7-643255ca4835)

## ✨ Features

- **Smart Job Tracking** - Organize applications with status updates, deadlines, and notes
- **Interactive Dashboard** - Visualize your job search progress with charts and metrics
- **User Authentication** - Secure login and admin controls via Supabase
- **Modern UI** - Clean interface built with Tailwind CSS and Radix UI
- **Data Management** - Powerful table views with AG Grid
- **Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Radix UI
- **Backend**: Prisma ORM 6, PostgreSQL
- **Authentication**: Supabase Auth
- **Data Grid**: AG Grid
- **Deployment**: Vercel (Hobby tier)

## 🏗️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (via Supabase)
- Supabase account

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

   # Database — use Transaction pooler URL from Supabase (port 6543)
   DATABASE_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres

   # Direct connection — used by Prisma migrations (port 5432)
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres

   # JWT Secret (from Supabase → Settings → API → JWT Settings)
   JWT_SECRET=your_jwt_secret
   ```

   > ⚠️ Never commit your `.env.local` file to version control

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## ☁️ Deploying to Vercel

This project is configured for Vercel. No custom build settings are needed — Vercel auto-detects Next.js.

### Environment Variables in Vercel

Add these in **Vercel → Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL (e.g. `https://applydash.vercel.app`) |
| `DATABASE_URL` | **Transaction pooler** URL from Supabase (port `6543`) — required for Vercel serverless |
| `DIRECT_URL` | **Direct connection** URL from Supabase (port `5432`) — used by Prisma migrations |
| `JWT_SECRET` | JWT secret from Supabase → Settings → API |

> ⚠️ Vercel serverless functions cannot use direct PostgreSQL connections (port 5432). Always use the **Transaction pooler** URL for `DATABASE_URL`.

### Supabase Auth Configuration

In **Supabase → Authentication → URL Configuration**, set:
- **Site URL**: `https://applydash.vercel.app`
- **Redirect URLs**: `https://applydash.vercel.app/**`

### First Deploy

1. Push to GitHub — Vercel deploys automatically on every push to `main`
2. After the first deploy, run migrations if needed:
   ```bash
   npx prisma migrate deploy
   ```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database browser |
| `npx prisma migrate dev` | Run migrations in development |
| `npx prisma migrate deploy` | Run migrations in production |

## 📁 Project Structure

```
APPLYDASH/
├── app/              # Next.js app directory (pages & API routes)
├── components/       # Reusable UI components
├── lib/              # Shared utilities and services
├── prisma/           # Database schema and migrations
├── public/           # Static assets
├── scripts/          # Utility scripts
├── utils/            # Helper functions
├── validation/       # Zod validation schemas
└── data/             # Sample/seed data
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙋‍♂️ Support

If you have questions or need help:
- Open an [issue](https://github.com/Pacoaldev/APPLYDASH/issues)

---

Made with ❤️ for job seekers everywhere
