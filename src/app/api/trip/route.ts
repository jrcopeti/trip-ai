import { generateTrip } from "@/app/api/anthropicApi";

/**
 * Generates the trip for a `TripRequest` body, writes it unsaved and answers `{ tripUrl }`;
 * 400 for a body that isn't JSON, 500 when generation fails. `generateTrip` checks the
 * request again, as for any public endpoint.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body is not JSON" }, { status: 400 });
  }

  try {
    const trip = await generateTrip(body);
    return Response.json({ tripUrl: trip.tripUrl });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "The trip could not be generated" }, { status: 500 });
  }
}
