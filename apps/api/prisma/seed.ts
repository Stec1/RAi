import { PrismaClient } from './generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// GENESIS R-01 seed — RA's first worlds (R-DL-03).
//
// The universe is RA + Observatories; there are no domains. The two worlds
// below are RA's own — the founding examples, publicly visible from day one.
// Each is owned by a SYSTEM user that cannot log in: the user has NO
// credential Account row (Better Auth email sign-in requires one), and the
// emails live under the reserved @system.rai.internal namespace.
//
// Idempotent: everything upserts by deterministic id / unique name, and the
// script never deletes or modifies real user rows. The v1 domain seed and
// the v1 test users/observatories are gone (kill-map P-02); any previously
// seeded v1 test rows in a live database are left untouched (OQ-08 —
// founder decision on production cleanup).
// ---------------------------------------------------------------------------

const SYSTEM_USERS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'wawel@system.rai.internal',
    name: 'RA',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'signal-garden@system.rai.internal',
    name: 'RA',
  },
];

// Ordered content blocks (shared ContentBlock shape). Image blocks are
// absent by design — media arrives at R-02. The first note block frames
// each world as RA's own (concept.md §3).
const RA_WORLDS = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    userId: SYSTEM_USERS[0]!.id,
    name: 'wawel-dragons-hill',
    displayName: "Wawel: The Dragon's Hill",
    type: 'individual' as const,
    visibility: 'public' as const,
    bio: "One of RA's own first worlds: a limestone hill, a thousand years of Kraków, and the fire underneath.",
    visualSignature: {
      primaryColor: '#d08a4e',
      secondaryColor: '#8a4a32',
      gradientAngle: 24,
      ambientEffect: 'glow',
      effectIntensity: 0.6,
      surfaceStyle: 'grain',
      accentColor: '#ffd9a8',
      nodeStyle: 'ring',
    },
    content: [
      {
        id: 'wawel-ra-note',
        type: 'note',
        text: 'This is one of the first worlds in the universe — composed by RA, the mind at the center, so no one arrives to an empty sky.',
      },
      { id: 'wawel-h-overture', type: 'heading', text: 'Overture' },
      {
        id: 'wawel-t-overture',
        type: 'text',
        text: 'Every city keeps one place where its whole story can stand in a single view. For Kraków it is Wawel: cathedral, castle, and rock, stacked on a bend of the Vistula. You arrive expecting architecture. You leave having read a biography.',
      },
      { id: 'wawel-h-hill', type: 'heading', text: 'The Hill' },
      {
        id: 'wawel-t-hill',
        type: 'text',
        text: 'The hill came first. Limestone, riddled with caves, settled long before any crown arrived. Kings built on it because the river bends there and the plain is visible in every direction. Coronations, fires, partitions, restorations — the hill absorbed each one and kept its shape.',
      },
      { id: 'wawel-h-dragon', type: 'heading', text: 'The Dragon' },
      {
        id: 'wawel-t-dragon',
        type: 'text',
        text: "Under the rock lives the story children learn first: the Wawel Dragon, defeated not by knights but by a cobbler's trick — a sheepskin stuffed with sulfur. The bronze dragon by the cave still breathes fire on a timer. Nobody old enough to know better seems to mind.",
      },
      { id: 'wawel-h-notes', type: 'heading', text: 'Notes for the Visitor' },
      {
        id: 'wawel-t-notes',
        type: 'text',
        text: "Come early, before the courtyard fills. The cathedral holds the bells; climb to Sigismund if your shoulders allow it. The dragon's cave opens in season. The river bank below is where the city actually rests.",
      },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    userId: SYSTEM_USERS[1]!.id,
    name: 'signal-garden',
    displayName: 'Signal Garden',
    type: 'individual' as const,
    visibility: 'public' as const,
    bio: "One of RA's own first worlds: a generative garden that grows from the signals visitors leave behind.",
    visualSignature: {
      primaryColor: '#6a4da8',
      secondaryColor: '#2e6e6a',
      gradientAngle: 152,
      ambientEffect: 'drift',
      effectIntensity: 0.5,
      surfaceStyle: 'mesh',
      accentColor: '#9fe0d8',
      nodeStyle: 'pulse',
    },
    content: [
      {
        id: 'garden-ra-note',
        type: 'note',
        text: 'This is one of the first worlds in the universe — composed by RA, the mind at the center, so no one arrives to an empty sky.',
      },
      { id: 'garden-h-seed', type: 'heading', text: 'Seed' },
      {
        id: 'garden-t-seed',
        type: 'text',
        text: 'The garden begins as a single procedural stem in a dark field. Every visitor arrives as a signal — a timestamp, a path, a pause — and the stem records it in its geometry. Nothing here is drawn by hand; nothing is stored but the signals themselves. The garden only grows while someone is watching.',
      },
      { id: 'garden-h-growth', type: 'heading', text: 'Growth' },
      {
        id: 'garden-t-growth',
        type: 'text',
        text: 'Signals accumulate into branches. A returning visitor thickens a stem; a long pause opens a leaf; a new path forks the geometry where two curiosities diverged. The palette drifts between violet and teal as density changes, and old growth slowly loses saturation, the way memory does. No two hours of the garden render the same way.',
      },
      { id: 'garden-h-bloom', type: 'heading', text: 'The Night Bloom' },
      {
        id: 'garden-t-bloom',
        type: 'text',
        text: 'Once a cycle, when activity falls low enough, the garden blooms in the dark: every recorded signal lights at once, briefly — a map of everyone who ever paused here — then settles back into slow growth. Visitors who catch the bloom tend to stay longer than they planned. Some return only for it.',
      },
    ],
  },
];

async function main() {
  console.log("Seeding RA's first worlds...");

  for (const user of SYSTEM_USERS) {
    // No Account row is ever created for these users — with no credential
    // (and no OAuth) account, Better Auth has nothing to sign in against.
    await prisma.user.upsert({
      where: { id: user.id },
      update: { name: user.name },
      create: { id: user.id, email: user.email, name: user.name },
    });
  }
  console.log(`  ${SYSTEM_USERS.length} system users upserted.`);

  for (const world of RA_WORLDS) {
    await prisma.observatory.upsert({
      where: { name: world.name },
      // publishedAt is intentionally NOT updated on re-seed — the first
      // publish stands. userId/name are never rewritten.
      update: {
        displayName: world.displayName,
        type: world.type,
        visibility: world.visibility,
        bio: world.bio,
        visualSignature: world.visualSignature,
        content: world.content,
      },
      create: {
        id: world.id,
        userId: world.userId,
        name: world.name,
        displayName: world.displayName,
        type: world.type,
        visibility: world.visibility,
        bio: world.bio,
        visualSignature: world.visualSignature,
        content: world.content,
        publishedAt: new Date(),
      },
    });
  }
  console.log(`  ${RA_WORLDS.length} RA worlds upserted.`);

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
