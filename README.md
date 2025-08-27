# ApplyDash

Job Tracker & Dashboard built with Next.js, React, Tailwind CSS, Prisma, Supabase, and AG Grid.

## Features
- User and admin authentication (Supabase)
- Job management and visualization (AG Grid)
- Modern UI with Tailwind and Radix UI
- Backend powered by Prisma and PostgreSQL
- Responsive and production-ready

## Installation
```bash
pnpm install
```

## Development
```bash
pnpm dev
```

## Deployment
1. Set up your environment variables in `.env` (see credentials section).
2. Run:
```bash
pnpm build
pnpm start
```

## Environment Variables
Create a `.env` file with your credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
```
Do not commit `.env` to the repository.

## Useful Scripts
- `pnpm lint` — Linting
- `pnpm build` — Production build
- `pnpm start` — Start in production

## Project Structure
- `app/` — Next.js pages and routes
- `components/` — UI components
- `lib/` — Logic and services
- `prisma/` — Schema and migrations
- `public/` — Static assets
- `utils/` — Utilities
- `validation/` — Zod schemas
- `data/` — Sample data

## Contributing
1. Fork and clone the repository
2. Create a branch: `git checkout -b feature/new-feature`
3. Make your changes and open a Pull Request

## License
MIT
