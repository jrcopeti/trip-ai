import Anthropic from "@anthropic-ai/sdk";
import { randomBytes } from "node:crypto";
import type { Trip } from "@/generated/prisma/client";
import prisma from "@/db";
import { tripForecast, type ForecastDay } from "@/lib/agent/forecast";
import { buildSystemPrompt, buildTripMessage } from "@/lib/agent/prompt";
import { TripRequestSchema, type TripRequest } from "@/lib/agent/request";
import {
  TripDataSchema,
  parseListFields,
  submitTripTool,
  type TripData,
} from "@/lib/agent/submitTrip";
import type { Place } from "@/lib/place";
import { toTripRow } from "@/lib/tripRow";
import { resolvePlace } from "./geoNamesApi";
import { fetchForecast } from "./openWeatherApi";
import { fetchTripImage } from "./unsplashApi";
import { heldTripDataFixture, useE2EFixtures } from "./e2eFixtures";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Plans the trip for `input`, writes it unsaved and returns the row. The request is checked and
 * the city resolved again, whatever the browser did. Once `signal` aborts it stops the model's
 * call, starts nothing more, writes no row unless the write had begun, and rejects with the
 * signal's reason.
 */
export async function generateTrip(input: unknown, signal?: AbortSignal): Promise<Trip> {
  const request = TripRequestSchema.safeParse(input);
  if (!request.success) {
    console.error("generateTrip: invalid request", request.error.flatten());
    throw new Error("The trip request was not valid");
  }
  const req = request.data;

  signal?.throwIfAborted();
  const resolved = await resolvePlace(req.city, req.countryCode);
  signal?.throwIfAborted();
  if (!resolved.ok) throw new Error(`The city could not be resolved: ${resolved.error}`);

  // Searched by GeoNames' name, not the raw spelling; a trip without photos is still a trip.
  const images = fetchTripImage(resolved.place.name).catch(() => ({
    tripImages: [],
    placeholder: null,
  }));
  const forecast = req.byWeather ? await forecastFor(req, resolved.place) : [];
  signal?.throwIfAborted();
  const tripData = useE2EFixtures
    ? ((await heldTripDataFixture(signal)) as TripData)
    : await askForTrip(req, resolved.place, forecast, signal);
  const photos = await images;
  signal?.throwIfAborted();

  // 48 random bits: `tripUrl` is unique, so a clash would fail the write.
  const tripUrl = randomBytes(6).toString("hex");
  return prisma.trip.create({
    data: toTripRow({
      request: req,
      place: resolved.place,
      tripData,
      images: photos,
      tripUrl,
      byWeather: forecast.length > 0,
    }),
  });
}

// A failed fetch plans for the usual weather, as a trip without the forecast does.
async function forecastFor(req: TripRequest, place: Place): Promise<ForecastDay[]> {
  try {
    const readings = await fetchForecast({ lat: place.lat, lon: place.lng });
    return tripForecast(readings, req.startDate, req.endDate);
  } catch (error) {
    console.error("generateTrip: no forecast", error);
    return [];
  }
}

/**
 * Asks the model for the trip, and once more when a list arrives as text that won't parse into
 * one: a slip that fails fast and cheap, whatever the prompt (PLAN.md, 2m-b). Throws on a second
 * broken answer, an otherwise invalid trip, or anything `callForTrip` throws.
 */
async function askForTrip(
  req: TripRequest,
  place: Place,
  forecast: ForecastDay[],
  signal?: AbortSignal,
): Promise<TripData> {
  for (let attempt = 1; ; attempt++) {
    const { input, parsed, broken } = parseListFields(
      await callForTrip(req, place, forecast, signal),
    );
    if (parsed.length > 0) console.warn("generateTrip: parsed lists sent as strings:", parsed);
    if (Object.keys(broken).length > 0) {
      console.warn("generateTrip: lists sent as broken text:", broken);
      if (attempt === 1) {
        signal?.throwIfAborted();
        continue;
      }
    }
    const trip = TripDataSchema.safeParse(input);
    if (!trip.success) {
      console.error("generateTrip: invalid trip", trip.error.flatten());
      throw new Error("The model returned an invalid trip");
    }
    return trip.data;
  }
}

/** One model call; returns `submit_trip`'s input, unchecked. */
async function callForTrip(
  req: TripRequest,
  place: Place,
  forecast: ForecastDay[],
  signal?: AbortSignal,
): Promise<unknown> {
  let response: Anthropic.Message;
  try {
    // Streamed so an abort ends the call where it is: a `create` call runs to its end, all of
    // its output billed, whenever the client leaves.
    const stream = client.messages.stream(
      {
        model: "claude-sonnet-5-5",
        max_tokens: 16000,
        system: [{ type: "text", text: buildSystemPrompt(), cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: buildTripMessage(req, place, forecast) }],
        tools: [submitTripTool],
        // Sonnet 5.5 rejects a forced tool choice; the prompt asks for submit_trip and `strict` keeps its shape.
        tool_choice: { type: "auto" },
      },
      { signal },
    );
    response = await stream.finalMessage();
  } catch (error: unknown) {
    // Stopped by the traveller, not failed: nothing to report, and the route knows it by the reason.
    if (error instanceof Anthropic.APIUserAbortError && signal?.aborted) throw signal.reason;
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
    } else {
      console.error("Error:", error);
    }
    throw new Error("Error in generating response from AI");
  }

  // Both can cut a tool call off mid-input, so neither turn's input is read.
  if (response.stop_reason === "refusal") {
    console.error("generateTrip: refused", response.stop_details);
    throw new Error("The model declined to plan this trip");
  }
  if (response.stop_reason === "max_tokens") {
    console.error("generateTrip: ran out of tokens", response.usage);
    throw new Error("The trip was cut off before it was finished");
  }

  const call = response.content.find(
    (block): block is Anthropic.ToolUseBlock =>
      block.type === "tool_use" && block.name === submitTripTool.name,
  );
  if (!call) {
    console.error("generateTrip: no submit_trip call", response.stop_reason);
    throw new Error("The model did not return a trip");
  }

  return call.input;
}
