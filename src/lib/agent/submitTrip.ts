import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { TOUR_KINDS } from "@/lib/tourKinds";

/** The trip as `submit_trip` returns it. The traveller's own items are the app's, not the model's. */
export const TripDataSchema = z.object({
  title: z.string().min(1),
  objectsList: z
    .object({
      quantity: z.number().int().positive(),
      item: z.string().min(1),
      description: z.string().min(1),
    })
    .array()
    .min(6)
    .max(15),
  mustHave: z.string().min(1).array().min(1),
  description: z.string().min(1),
  tours: z
    .object({
      title: z.string().min(1),
      kind: z.enum(TOUR_KINDS),
      description: z.string().min(1),
    })
    .array()
    .length(5),
  tip: z.string().min(1),
});

export type TripData = z.infer<typeof TripDataSchema>;

// Strict tool schemas reject array-length and string-length keywords, so the
// counts live in the descriptions and the system prompt, and Zod enforces them.
export const submitTripTool: Anthropic.Tool = {
  name: "submit_trip",
  description:
    "Submit the finished trip: title, packing list, must-haves, description, five tours and a tip. Call it once, with the whole trip.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "The trip's title, with the traveller's name and the city." },
      objectsList: {
        type: "array",
        description: "Between 6 and 15 items to pack, none of them already on the traveller's list.",
        items: {
          type: "object",
          properties: {
            quantity: { type: "integer", description: "How many to pack." },
            item: { type: "string", description: "The item." },
            description: { type: "string", description: "Why it suits this trip, in up to ten words." },
          },
          required: ["quantity", "item", "description"],
          additionalProperties: false,
        },
      },
      mustHave: {
        type: "array",
        description: "The essentials this trip cannot do without.",
        items: { type: "string" },
      },
      description: { type: "string", description: "Up to three short paragraphs on the feel of this trip." },
      tours: {
        type: "array",
        description: "Exactly five tours.",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Up to six words, naming the place or the activity." },
            kind: { type: "string", enum: [...TOUR_KINDS], description: "What kind of tour it is." },
            description: {
              type: "string",
              description: "One paragraph of 100 to 120 words: what it is and why it suits this trip.",
            },
          },
          required: ["title", "kind", "description"],
          additionalProperties: false,
        },
      },
      tip: { type: "string", description: "Up to two short paragraphs of practical advice." },
    },
    required: ["title", "objectsList", "mustHave", "description", "tours", "tip"],
    additionalProperties: false,
  },
};
