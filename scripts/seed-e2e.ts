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
 * It seeds `E2E_DATABASE_URL` (the local container by default), never `.env`'s
 * production database. Set ALLOW_REMOTE_E2E_SEED=1 to seed a remote one, deliberately.
 */
import { PrismaClient } from "@prisma/client";
import { tripCreateInput, tripFixture, tripFixture2 } from "../src/test/fixtures/trip";
import { E2E_DATABASE_URL, mayWriteToDatabase } from "./localDatabase";

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
    countryCode: "NO",
    lat: 59.91273,
    lng: 10.74609,
    tripUrl: "gh56i",
    saved: false,
  }),
];

async function main() {
  const url = E2E_DATABASE_URL;

  const host = new URL(url).hostname;
  if (!mayWriteToDatabase(url)) {
    throw new Error(
      `Refusing to seed ${host}: this deletes every trip. Point E2E_DATABASE_URL at a ` +
        `throwaway database, or set ALLOW_REMOTE_E2E_SEED=1 if you really mean it.`,
    );
  }

  const prisma = new PrismaClient({ datasources: { db: { url } } });
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
