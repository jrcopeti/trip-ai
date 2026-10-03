/**
 * Seeds the database the Playwright suite runs against.
 *
 * Wipes every trip first, so a run starts from a known set regardless of what a
 * previous run's save/discard flow left behind. Intended for a throwaway database
 * — CI's `postgres` service container, or a local one you do not mind clearing.
 *
 *   npm run seed:e2e
 *
 * Because it deletes everything, it refuses to run against a non-local host.
 * `.env` here points at the production Neon database, and an exported
 * DATABASE_URL would otherwise be one command away from wiping it. Set
 * ALLOW_REMOTE_E2E_SEED=1 to override, deliberately.
 */
import { PrismaClient } from "@prisma/client";
import { tripCreateInput, tripFixture, tripFixture2 } from "../src/test/fixtures/trip";

/** The rows `saved-trips.spec.ts` asserts against. */
const seeds = [
  tripCreateInput(tripFixture),
  tripCreateInput(tripFixture2),
  // An unsaved trip, so the `saved: true` filter has something to exclude.
  tripCreateInput({
    ...tripFixture,
    id: 3,
    userName: "carla",
    city: "oslo",
    country: "Norway",
    tripUrl: "gh56i",
    saved: false,
  }),
];

async function main() {
  // Checked before the client is constructed, so a missing variable reports
  // this rather than a Prisma initialisation error.
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required to seed the e2e database");
  }

  const host = new URL(url).hostname;
  const isLocal = ["localhost", "127.0.0.1", "::1", "postgres"].includes(host);
  if (!isLocal && process.env.ALLOW_REMOTE_E2E_SEED !== "1") {
    throw new Error(
      `Refusing to seed ${host}: this deletes every trip. Point DATABASE_URL at a ` +
        `throwaway database, or set ALLOW_REMOTE_E2E_SEED=1 if you really mean it.`,
    );
  }

  const prisma = new PrismaClient();
  try {
    await prisma.trip.deleteMany();
    await prisma.trip.createMany({ data: seeds });

    const count = await prisma.trip.count();
    const saved = seeds.filter((trip) => trip.saved).length;
    console.log(`Seeded ${count} trips (${saved} saved).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
