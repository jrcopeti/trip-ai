"use server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemInstructions =
  "You are a seasoned tour guide specializing in assisting travelers with packing for their trips, considering their preferences, the destination, the trip's duration, and the weather forecast. Your task is to compile a detailed packing list of at least 9 different items, specifying quantities (e.g., 3 T-shirts, 2 pairs of shoes). Also, create a creative trip title incorporating the traveler's name, city, and country. Provide a brief trip description highlighting the journey's essence in up to three paragraphs. Recommend three specific activities to enjoy in the destination city. Each activity description should be up to three paragraphs long. If the city does not exist in the country specified, has a population less than one, any of the object's values are missing or incorrect, return { trip: null } immediately. This is crucial for the functionality of the app.";
const functionData = {
  name: "displayData",
  description:
    "Generate a detailed packing list and trip plan based on the tourist's trip information. Validate city existence in the specified country and other conditions. Return null for any validation failures.",
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
          "A creative title for the trip with 12 words, that includes the userName, city and country.",
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
        minItems: 3,
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
    ],
  },
};

export const fetchResponseAI = async (prompt: string) => {
  console.log("Generating response");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemInstructions },
        { role: "user", content: prompt },
      ],
      tools: [{ type: "function", function: functionData }],
      tool_choice: { type: "function", function: { name: "displayData" } },
      temperature: 0,
    });
    console.log("responsing");
    const data =
      response?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ??
      null;
    const parsedData = JSON.parse(data ?? "{trip: null}");
    console.log("Data:", data);
    console.log("parsedData:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error:", error);
    return undefined;
  }
};
