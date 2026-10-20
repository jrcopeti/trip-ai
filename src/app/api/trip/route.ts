import { generateTrip } from "@/app/api/anthropicApi";
import { TripRequestSchema } from "@/lib/agent/request";

const fail = (status: number, error: string) => Response.json({ error }, { status });

/**
 * Generates the trip for a `TripRequest` sent as JSON, writes it unsaved and answers
 * `{ tripUrl }`: 415 for another content type, 403 for a browser request from another page
 * than this site's, 400 for a body that isn't a valid request, 500 when generation fails.
 */
export async function POST(request: Request) {
  // JSON can't be sent cross-site without a preflight, which fails: the route sends no CORS headers.
  const type = request.headers.get("content-type")?.toLowerCase();
  if (!type?.startsWith("application/json")) return fail(415, "Send the request as application/json");

  // Set by the browser, not the page, and unaffected by proxies or the referrer policy. Absent
  // when no browser sent the request.
  const site = request.headers.get("sec-fetch-site");
  if (site !== null && site !== "same-origin") return fail(403, "Not from this site");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "The request body is not JSON");
  }
  const parsed = TripRequestSchema.safeParse(body);
  if (!parsed.success) return fail(400, "The trip request is not valid");

  try {
    const trip = await generateTrip(parsed.data);
    return Response.json({ tripUrl: trip.tripUrl });
  } catch (error) {
    console.error(error);
    return fail(500, "The trip could not be generated");
  }
}
