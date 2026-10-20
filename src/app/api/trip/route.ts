import { generateTrip } from "@/app/api/anthropicApi";
import { TripRequestSchema } from "@/lib/agent/request";

const fail = (status: number, error: string) => Response.json({ error }, { status });

/**
 * Generates the trip for a `TripRequest` sent as JSON from this site, writes it unsaved and
 * answers `{ tripUrl }`: 415 for another content type, 403 for another origin, 400 for a body
 * that isn't a valid request, 500 when generation fails.
 */
export async function POST(request: Request) {
  // JSON can't be sent cross-site without a preflight, which fails: the route sends no CORS headers.
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return fail(415, "Send the request as application/json");
  }
  // As Next checks a server action's: the browser's origin against the host it reached.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && new URL(origin).host !== host) return fail(403, "Not from this site");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "The request body is not JSON");
  }
  if (!TripRequestSchema.safeParse(body).success) return fail(400, "The trip request is not valid");

  try {
    const trip = await generateTrip(body);
    return Response.json({ tripUrl: trip.tripUrl });
  } catch (error) {
    console.error(error);
    return fail(500, "The trip could not be generated");
  }
}
