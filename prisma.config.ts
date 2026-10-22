import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Prisma 7 reads no `.env` itself; this loads `.env.local` and `.env` the way Next does.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Not `env()`, which throws when unset: `prisma generate` runs in CI's build with no URL.
  datasource: { url: process.env.DATABASE_URL },
});
