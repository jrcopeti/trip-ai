/**
 * Pushes the Prisma schema to the e2e database (`E2E_DATABASE_URL`), never to whatever
 * `.env` names. Same local-only guard as the seed script.
 *
 *   npm run db:push:e2e
 */
import { execSync } from "node:child_process";
import { E2E_DATABASE_URL, mayWriteToDatabase } from "./localDatabase";

if (!mayWriteToDatabase(E2E_DATABASE_URL)) {
  throw new Error(
    `Refusing to push the schema to ${new URL(E2E_DATABASE_URL).hostname}: not a local database. ` +
      `Set ALLOW_REMOTE_E2E_SEED=1 if you really mean it.`,
  );
}

execSync("npx prisma db push --skip-generate", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
});
