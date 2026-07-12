// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // ponytail: reuse one client per serverless instance (Vercel warm starts)
  var prisma: PrismaClient | undefined;
}

function withPoolerParams(url: string): string {
  if (url.includes('pgbouncer=true')) return url;
  // Supabase transaction pooler (PgBouncer) + Prisma on serverless needs this
  if (!url.includes('pooler') && !url.includes(':6543')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}pgbouncer=true&connection_limit=1`;
}

function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  return url ? withPoolerParams(url) : url;
}

function createPrismaClient() {
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  return new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
}

export const prisma = global.prisma ?? createPrismaClient();
global.prisma = prisma;
