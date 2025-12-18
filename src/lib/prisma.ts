import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Создаём Pool с твоим URL из .env (Unpooled для Neon)
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL не найден в .env');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // log: ['query'], // Опционально, убери если не нужен дебаг
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}