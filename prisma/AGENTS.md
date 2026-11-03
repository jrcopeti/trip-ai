# prisma

- **Schema changes go by `npx prisma db push`.** `migrations/` stopped in 2024 and is history; don't
  add to it.
- **A bare `npx prisma db push` hits `.env`'s production database here.** Ask first. For the e2e
  database, use `npm run db:push:e2e`.
- `db push` no longer generates the client in Prisma 7, so run `npx prisma generate` after a change.
