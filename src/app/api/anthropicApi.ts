"use server";
import Anthropic from "@anthropic-ai/sdk";
import { randomBytes } from "node:crypto";
import type { Trip } from "@prisma/client";
import prisma from "@/db";
import { tripForecast, type ForecastDay } from "@/lib/agent/forecast";
import { buildSystemPrompt, buildTripMessage } from "@/lib/agent/prompt";
import { TripRequestSchema, type TripRequest } from "@/lib/agent/request";
import { TripDataSchema, submitTripTool, type TripData } from "@/lib/agent/submitTrip";
import type { Place } from "@/lib/place";
import { toTripRow } from "@/lib/tripRow";
import { resolvePlace } from "./geoNamesApi";
import { fetchForecast } from "./openWeatherApi";
import { fetchTripImage } from "./unsplashApi";
import { tripDataFixture, useE2EFixtures } from "./e2eFixtures";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * A server action is a public endpoint, so the request is checked again here
 * and the city resolved again, whatever the browser already did. Writes the
 * trip unsaved and returns the row; the traveller's answer only flips `saved`.
 */
export async function generateTrip(input: unknown): Promise<Trip> {
  const request = TripRequestSchema.safeParse(input);
  if (!request.success) {
    console.error("generateTrip: invalid request", request.error.flatten());
    throw new Error("The trip request was not valid");
  }
  const req = request.data;

  const resolved = await resolvePlace(req.city, req.countryCode);
  if (!resolved.ok) throw new Error(`The city could not be resolved: ${resolved.error}`);

  // Searched by GeoNames' name, not the raw spelling; a trip without photos is still a trip.
  const images = fetchTripImage(resolved.place.name).catch(() => ({
    tripImages: [],
    placeholder: null,
  }));
  const forecast = req.byWeather ? await forecastFor(req, resolved.place) : [];
  const tripData = useE2EFixtures
    ? (tripDataFixture as TripData)
    : await askForTrip(req, resolved.place, forecast);

  // 48 random bits: `tripUrl` is unique, so a clash would fail the write.
  const tripUrl = randomBytes(6).toString("hex");
  return prisma.trip.create({
    data: toTripRow({
      request: req,
      place: resolved.place,
      tripData,
      images: await images,
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

async function askForTrip(
  req: TripRequest,
  place: Place,
  forecast: ForecastDay[],
): Promise<TripData> {
  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 16000,
      system: [{ type: "text", text: buildSystemPrompt(), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildTripMessage(req, place, forecast) }],
      tools: [submitTripTool],
      // Sonnet 5.5 rejects a forced tool choice; the prompt asks for submit_trip and `strict` keeps its shape.
      tool_choice: { type: "auto" },
    });
  } catch (error: unknown) {
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

  const trip = TripDataSchema.safeParse(call.input);
  if (!trip.success) {
    console.error("generateTrip: invalid trip", trip.error.flatten());
    throw new Error("The model returned an invalid trip");
  }
  return trip.data;
}
