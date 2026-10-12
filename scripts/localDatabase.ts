/**
 * Whether a connection string points at a database on this machine (or CI's
 * `postgres` service container) rather than a hosted one.
 *
 * `.env` here points at the production Neon database, so anything that writes
 * or wipes trips for the e2e suite — the seed script, the save/discard journey —
 * checks this first and refuses a remote host unless ALLOW_REMOTE_E2E_SEED=1.
 */
export const LOCAL_DATABASE_HOSTS = ["localhost", "127.0.0.1", "::1", "postgres"];

export function isLocalDatabase(url: string) {
  return LOCAL_DATABASE_HOSTS.includes(new URL(url).hostname);
}

export function mayWriteToDatabase(url: string | undefined) {
  return !!url && (isLocalDatabase(url) || process.env.ALLOW_REMOTE_E2E_SEED === "1");
}
