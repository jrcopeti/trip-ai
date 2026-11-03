# src/app/api

- **`POST /api/trip` is a route, not a server action.** Next runs server actions one at a time, so a
  cancelled generation would hold every later one (the city check, the next try) until the server
  finished it. A `fetch` can be aborted and queues behind nothing.
- **Only what the browser calls is a server action**, which here is `resolvePlace`. Everything else
  stays a plain module, so `/api/trip` is the only way in to generate a trip.
- **`maxDuration` over 60 needs the Vercel project's Fluid compute**, which is on. That is a dashboard
  setting, so nothing in the repo shows it.
