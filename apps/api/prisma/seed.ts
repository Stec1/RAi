import { PrismaClient } from './generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Domain seed data — from docs/domain-definitions.md
// Deterministic UUIDs — never auto-generated
// ---------------------------------------------------------------------------

const domains = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    name: 'Nexum',
    slug: 'nexum',
    description:
      'Engineers, AI researchers, developers, and builders of digital infrastructure. Fast-moving, signal-rich. The primary Domain for AI agent creators and tool builders.',
    theme: 'Technology, AI, development',
    positionX: 340,
    positionY: -160,
    active: true,
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    name: 'Keth',
    slug: 'keth',
    description:
      'Founders, product managers, strategists, investors, and those who build organizations and products at scale. AI systems focused on business intelligence, operations, and growth.',
    theme: 'Business, entrepreneurship, products',
    positionX: 420,
    positionY: 80,
    active: true,
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    name: 'Solum',
    slug: 'solum',
    description:
      'Scientists, researchers, academics, educators, and those who build understanding through evidence. AI systems focused on data analysis, scientific reasoning, and knowledge synthesis.',
    theme: 'Science, research, knowledge',
    positionX: 200,
    positionY: 300,
    active: true,
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    name: 'Vorda',
    slug: 'vorda',
    description:
      'Visual artists, graphic designers, illustrators, architects, typographers, and anyone who builds with aesthetic intent. AI systems focused on creative generation and design.',
    theme: 'Creativity, art, design',
    positionX: -320,
    positionY: -180,
    active: false,
  },
  {
    id: 'd0000000-0000-0000-0000-000000000005',
    name: 'Lyren',
    slug: 'lyren',
    description:
      'Musicians, producers, sound designers, DJs, composers, and those who work in the domain of audio and time. AI systems focused on sound generation and music.',
    theme: 'Music, sound, performance',
    positionX: -280,
    positionY: 240,
    active: false,
  },
  {
    id: 'd0000000-0000-0000-0000-000000000006',
    name: 'Auren',
    slug: 'auren',
    description:
      'Philosophers, ecologists, writers, and those who work at the boundary between systems and meaning. AI systems focused on synthesis, ethics, and long-term reasoning.',
    theme: 'Nature, philosophy, reflection',
    positionX: -400,
    positionY: 40,
    active: false,
  },
  {
    id: 'd0000000-0000-0000-0000-000000000007',
    name: 'Draxis',
    slug: 'draxis',
    description:
      'Experimenters, hackers of systems and culture, and those who resist categorization. AI systems that push boundaries and explore undefined territory.',
    theme: 'The unknown, experimentation, edges',
    positionX: 60,
    positionY: -380,
    active: false,
  },
];

// ---------------------------------------------------------------------------
// Test data — deterministic UUIDs
// ---------------------------------------------------------------------------

const testUsers = [
  {
    id: 't0000000-0000-0000-0000-000000000001',
    email: 'testuser1@rai.test',
    name: 'Test User One',
  },
  {
    id: 't0000000-0000-0000-0000-000000000002',
    email: 'testuser2@rai.test',
    name: 'Test User Two',
  },
  {
    id: 't0000000-0000-0000-0000-000000000003',
    email: 'testuser3@rai.test',
    name: 'Test User Three',
  },
];

const testObservatories = [
  {
    id: 'o0000000-0000-0000-0000-000000000001',
    userId: 't0000000-0000-0000-0000-000000000001',
    name: 'test-observatory-1',
    displayName: 'Test Observatory One',
    domainIds: ['d0000000-0000-0000-0000-000000000001'], // Nexum
  },
  {
    id: 'o0000000-0000-0000-0000-000000000002',
    userId: 't0000000-0000-0000-0000-000000000002',
    name: 'test-observatory-2',
    displayName: 'Test Observatory Two',
    domainIds: ['d0000000-0000-0000-0000-000000000002'], // Keth
  },
  {
    id: 'o0000000-0000-0000-0000-000000000003',
    userId: 't0000000-0000-0000-0000-000000000003',
    name: 'test-observatory-3',
    displayName: 'Test Observatory Three',
    domainIds: ['d0000000-0000-0000-0000-000000000003'], // Solum
  },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  console.log('Seeding domains...');
  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { id: domain.id },
      update: domain,
      create: domain,
    });
  }
  console.log(`  ${domains.length} domains seeded.`);

  console.log('Seeding test users...');
  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
  console.log(`  ${testUsers.length} test users seeded.`);

  console.log('Seeding test observatories...');
  for (const obs of testObservatories) {
    await prisma.observatory.upsert({
      where: { id: obs.id },
      update: obs,
      create: obs,
    });
  }
  console.log(`  ${testObservatories.length} test observatories seeded.`);

  console.log('Seed complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
