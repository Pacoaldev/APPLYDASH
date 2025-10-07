// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent multiple instantiations in dev
  var prisma: PrismaClient | undefined;
}

// Enhanced Prisma client with better error handling
function createPrismaClient() {
  try {
    console.log('🔧 Creating Prisma client...');
    
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
    
    console.log('✅ Prisma client created successfully');
    return client;
  } catch (error) {
    console.error('❌ Error creating Prisma client:', error);
    throw error;
  }
}

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
