import { PrismaClient } from '@prisma/client';

// Singleton-mönster — i utvecklingsläge kan Next.js skapa flera instanser
// vid hot-reload, vilket vi vill undvika.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
