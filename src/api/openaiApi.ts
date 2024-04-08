"use server";

import { redirect } from "next/navigation";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemInstructions =
  "You are a seasoned tour guide specializing in assisting travelers with packing for their trips, taking into account their preferences, the destination, the trip's duration, and the weather forecast. Your task is to compile a detailed packing list of 9 different items, specifying quantities (e.g., 3 T-shirts, 2 pairs of shoes). Additionally, craft a creative trip title incorporating the traveler's name and destination. Provide creative title where must have the user's name, the city and country. Also provide a brief trip description highlighting the journey's essence in up to three paragraphs. Finally, recommend three specific activities to enjoy in the destination city, with maximum 3 paragraphs each. If the city does not exist or it is not located in the country, or it's population is less than 1, return { trip: null }, with no additional characters.";

const functionData = {
  name: "displayData",
  description:
    "Generate a detailed packing list and trip plan based on the tourist's trip information, weather forecast, and personal preferences.",
  parameters: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "The city or location name of the trip destination.",
      },
      country: {
        type: "string",
        description: "The country name of the trip destination.",
      },
      userName: {
        type: "string",
        description: "The name of the traveler.",
      },
      title: {
        type: "string",
        description:
          "A creative title for the trip that includes the userName and the destination in the format: City, Country.",
      },
      objectsList: {
        type: "array",
        description:
          "A detailed list of items to pack, specifying the quantity, the item, and a brief description for each.",
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
                "A short description or reason why this item is recommended with maximum 10 words.",
            },
          },
          required: ["quantity", "item", "description"],
        },
        minItems: 9,
      },
      mustHave: {
        type: "array",
        description:
          "A list of must-have items for the trip, such as passport, tickets, money, charger, etc.",
        items: {
          type: "string",
        },
      },
      requiredItems: {
        type: "array",
        description:
          "Include the items the user has writen in the required items field. If there is no item, return an empty array.",
        items: {
          type: "string",
        },
      },
      description: {
        type: "string",
        description:
          "A brief description of the trip, capturing its essence in a maximum of three paragraphs.",
      },
      tours: {
        type: "array",
        description:
          "Three suggested tours or activities in the city or location in maximum of three paragraphs each.",
        items: {
          type: "string",
        },
        required: ["tour1", "tour2", "tour3"],
      },
    },
    required: [
      "city",
      "country",
      "userName",
      "title",
      "objectsList",
      "mustHave",
      "description",
      "tour",
      "countryCode",
    ],
  },
};

export const fetchResponseAI = async (prompt: string) => {
  console.log("Generating response");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemInstructions },
        { role: "user", content: prompt },
      ],
      tools: [{ type: "function", function: functionData }],
      tool_choice: { type: "function", function: { name: "displayData" } },
      temperature: 0.5,
    });
    console.log("responsing");
    const data =
      response?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ??
      null;
    const parsedData = JSON.parse(data ?? "{}");
    console.log("Data:", data);
    console.log("parsedData:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error:", error);
  }
};
