import 'dotenv/config'; // Загружает .env и .env.local

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma', // Если файл в папке prisma — измени на 'prisma/schema.prisma'
  datasource: {
    url: env('DATABASE_URL_UNPOOLED') ?? env('DATABASE_URL') ?? '',
  },
});