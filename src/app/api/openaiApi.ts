"use server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemInstructions =
  "You are a seasoned tour guide specializing in assisting travelers with packing for their trips, considering their preferences, the destination, the trip's duration, and the weather forecast. Your task is to compile a detailed packing list of 9 (nine) different items, specifying quantities (e.g., 3 T-shirts, 2 pairs of shoes). Also, create a creative trip title incorporating the traveler's name, city, and country. Provide a brief trip description highlighting the journey's essence in up to three paragraphs. Recommend three specific activities to enjoy in the destination city, with each description being up to three paragraphs long.";
const functionData = {
  name: "tripData",
  description:
    "The first step in the function is to validate the existence of the specified city within the given country using a reliable data source. If this validation fails due to the city not existing, having a population less than one, or any other critical data mismatch, the function must immediately return { trip: null } without further processing. This ensures the integrity and applicability of the travel planning process. If validation is successful, the function will then proceed to: This function generates a detailed packing list and a comprehensive trip plan based on the tourist's provided trip information. Create a packing list, a creative trip title, a descriptive trip summary, and suggestions for three activities based on the traveler's preferences and the local weather conditions.",
  parameters: {
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
          "A detailed list of items to pack, specifying the quantity, the item, and a brief description for each. Do not repeat the required items.",
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
        minItems: 9,
      },
      mustHave: {
        type: "array",
        description:
          "A list of four must-have items for the trip. Do not repeat the required items.",
        items: {
          type: "string",
        },
      },
      requiredItems: {
        type: "array",
        description:
          "Include the items the user has writen in the required items field. If there is no item, return an empty array. It's very important to return empty array in case there is no item in the required items field for the integrity of the aplication.",
        items: {
          type: "string",
        },
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
        items: {
          type: "string",
        },
        minItems: 3,
      },
      tip: {
        type: "string",
        description:
          "A brief tip of maximum 2 paragraphs, taking in consideration the transport, accomodation and luggage size from the user's prompt, and also the weather from forecast data or the average for the time of the year.",
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
  },
};

export const fetchResponseAI = async (prompt: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstructions },
        { role: "user", content: prompt },
      ],
      tools: [{ type: "function", function: functionData }],
      tool_choice: { type: "function", function: { name: "tripData" } },
      temperature: 0,
    });
    const data =
      response.choices?.[0].message.tool_calls?.[0]?.function.arguments ?? null;
    const parsedData = JSON.parse(data ?? "");

    if (parsedData.trip === null) {
      return null;
    } else {
      return parsedData;
    }
  } catch (error: unknown) {
    console.error("Error:", error);
    throw new Error("Error in generating response from AI");
  }
};
