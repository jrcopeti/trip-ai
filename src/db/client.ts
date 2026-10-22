import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * A Prisma client on `pg` for `connectionString`; it gives up on a connection after 5s.
 * The app's singleton, the e2e seed and the save/discard spec all build theirs here.
 */
export function createPrismaClient(connectionString: string | undefined) {
  // Without it `pg` waits forever for a connection; Prisma 5 gave up after 5s.
  const adapter = new PrismaPg({ connectionString, connectionTimeoutMillis: 5_000 });
  return new PrismaClient({ adapter });
}
