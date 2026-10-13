"use server";
import Anthropic from "@anthropic-ai/sdk";
import type { Trip } from "@prisma/client";
import { buildSystemPrompt, buildTripMessage } from "@/lib/agent/prompt";
import { TripRequestSchema } from "@/lib/agent/request";
import { TripDataSchema, submitTripTool } from "@/lib/agent/submitTrip";
import { resolvePlace } from "./geoNamesApi";
import { tripDataFixture, useE2EFixtures } from "./e2eFixtures";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * A server action is a public endpoint, so the request is checked again here
 * and the city resolved again, whatever the browser already did.
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

  if (useE2EFixtures) return tripDataFixture;

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 16000,
      system: [{ type: "text", text: buildSystemPrompt(), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildTripMessage(req, resolved.place) }],
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
  // The trip page reads the generated fields off a `Trip`; the rest is merged from the form.
  return trip.data as unknown as Trip;
}
