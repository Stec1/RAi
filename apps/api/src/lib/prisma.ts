// Prisma singleton — the only place PrismaClient is instantiated.
// All DB access in apps/api must go through this import.

import { PrismaClient } from '../../prisma/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
