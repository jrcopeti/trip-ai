import { generateTrip } from "@/app/api/anthropicApi";
import { TripRequestSchema } from "@/lib/agent/request";

// A generation takes up to ~70s, past `vercel.json`'s 60. Over 60 on Hobby needs the project's
// Fluid compute on, or the deploy fails.
export const maxDuration = 300;

const fail = (status: number, error: string) => Response.json({ error }, { status });

/**
 * Generates the trip for a `TripRequest` sent as JSON, writes it unsaved and answers
 * `{ tripUrl }`: 415 for another content type, 403 when the browser's `Sec-Fetch-Site` names
 * another site, 400 for a body that isn't a valid request, 500 when generation fails.
 */
export async function POST(request: Request) {
  // The cross-site guard: JSON can't be sent cross-site without a preflight, which fails while
  // the route sends no CORS headers and has no OPTIONS handler. Adding either removes it.
  const type = request.headers.get("content-type")?.toLowerCase();
  if (!type?.startsWith("application/json")) return fail(415, "Send the request as application/json");

  // Set by the browser, not the page, and unaffected by proxies or the referrer policy. Absent
  // when no browser, or one without Fetch Metadata, sent the request.
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
    const trip = await generateTrip(parsed.data, request.signal);
    return Response.json({ tripUrl: trip.tripUrl });
  } catch (error) {
    // A cancelled generation rejects with the signal's reason, and nobody is left to answer. A
    // real failure that lands as the client goes is still logged.
    if (error !== request.signal.reason) console.error(error);
    return fail(500, "The trip could not be generated");
  }
}
