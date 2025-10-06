# APPLYDASH

Track your job applications with style and precision. Watch your career opportunities come to life.

🚀 **Live App:** https://applydash-wydn4.ondigitalocean.app

![APPLYDASH Screenshot](https://github.com/user-attachments/assets/83ae6bde-a63e-4f5c-a7f7-643255ca4835)

## ✨ Features

- **Smart Job Tracking** - Organize applications with status updates, deadlines, and notes
- **Interactive Dashboard** - Visualize your job search progress with charts and metrics
- **User Authentication** - Secure login and admin controls via Supabase
- **Modern UI** - Clean interface built with Tailwind CSS and Radix UI
- **Data Management** - Powerful table views with AG Grid
- **Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Radix UI
- **Backend**: Prisma ORM, PostgreSQL
- **Authentication**: Supabase Auth
- **Data Grid**: AG Grid
- **Deployment Ready**: Optimized for production

## 🏗️ Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fralopala2/APPLYDASH.git
   cd APPLYDASH
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your_jwt_secret_key
   ```
   
   > ⚠️ Never commit your `.env` file to version control

4. **Run database migrations**
   ```bash
   pnpm prisma migrate dev
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📦 Production Deployment

```bash
pnpm build
pnpm start
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm prisma studio` | Open Prisma database browser |

## 📁 Project Structure

```
APPLYDASH/
├── app/              # Next.js app directory (pages & API routes)
├── components/       # Reusable UI components
├── lib/             # Shared utilities and services
├── prisma/          # Database schema and migrations
├── public/          # Static assets
├── utils/           # Helper functions
├── validation/      # Zod validation schemas
└── data/           # Sample/seed data
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙋‍♂️ Support

If you have questions or need help:
- Open an [issue](https://github.com/Fralopala2/APPLYDASH/issues)
- Check existing [discussions](https://github.com/Fralopala2/APPLYDASH/discussions)

---

Made with ❤️ for job seekers everywhere
