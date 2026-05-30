"use server";
import Anthropic from "@anthropic-ai/sdk";
import type { Trip } from "@prisma/client";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemInstructions =
  "You are a seasoned tour guide specializing in assisting travelers with packing for their trips, considering their preferences, the destination, the trip's duration, and the weather forecast. Your task is to compile a detailed packing list of 9 (nine) different items, specifying quantities (e.g., 3 T-shirts, 2 pairs of shoes). Also, create a creative trip title incorporating the traveler's name, city, and country. Provide a brief trip description highlighting the journey's essence in up to three paragraphs. Recommend three specific activities to enjoy in the destination city, with each description being up to three paragraphs long.";

const tripToolDescription =
  "The first step in the function is to validate the existence of the specified city within the given country using a reliable data source. If this validation fails due to the city not existing, having a population less than one, or any other critical data mismatch, the function must immediately return { trip: null } without further processing. This ensures the integrity and applicability of the travel planning process. If validation is successful, the function will then proceed to: This function generates a detailed packing list and a comprehensive trip plan based on the tourist's provided trip information. Create a packing list, a creative trip title, a descriptive trip summary, and suggestions for three activities based on the traveler's preferences and the local weather conditions.";

const tripInputSchema: Anthropic.Tool["input_schema"] = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description:
        "A creative title for the trip with 12 (twelve) words, that includes the capitalized userName, city and country",
    },
    objectsList: {
      type: "array",
      description:
        "A detailed list of 9 items to pack, specifying the quantity, the item, and a brief description for each. Do not repeat the required items.",
      items: {
        type: "object",
        properties: {
          quantity: {
            type: "number",
            description: "The quantity of each item to pack.",
          },
          item: {
            type: "string",
            description: "The name of the item to pack.",
          },
          description: {
            type: "string",
            description:
              "A short description or reason why this item is recommended with maximum 10 (ten) words.",
          },
        },
        required: ["quantity", "item", "description"],
      },
    },
    mustHave: {
      type: "array",
      description:
        "A list of four must-have items for the trip. Do not repeat the required items.",
      items: { type: "string" },
    },
    requiredItems: {
      type: "array",
      description:
        "Include the items the user has written in the required items field. If there is no item, return an empty array. It's very important to return an empty array in case there is no item in the required items field for the integrity of the application.",
      items: { type: "string" },
    },
    description: {
      type: "string",
      description:
        "A brief description of the trip, capturing its essence in a maximum of 3 (three) paragraphs.",
    },
    tours: {
      type: "array",
      description:
        "Three suggested tours or activities in the city or location in maximum of 3 (three) paragraphs each.",
      items: { type: "string" },
    },
    tip: {
      type: "string",
      description:
        "A brief tip of maximum 2 paragraphs, taking in consideration the transport, accommodation and luggage size from the user's prompt, and also the weather from forecast data or the average for the time of the year.",
    },
  },
  required: [
    "title",
    "objectsList",
    "mustHave",
    "requiredItems",
    "description",
    "tours",
    "tip",
  ],
};

export const fetchResponseAI = async (prompt: string): Promise<Trip | null> => {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: systemInstructions,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      tools: [
        {
          name: "tripData",
          description: tripToolDescription,
          input_schema: tripInputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "tripData" },
    });

    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    const parsedData = toolUseBlock?.input ?? null;

    if (parsedData === null) {
      return null;
    }

    const data = parsedData as Record<string, unknown>;
    if (data.trip === null) {
      return null;
    }

    return parsedData as unknown as Trip;
  } catch (error: unknown) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
    } else {
      console.error("Error:", error);
    }
    throw new Error("Error in generating response from AI");
  }
};
