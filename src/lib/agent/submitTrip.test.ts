import { describe, expect, it } from "vitest";
import { tripDataFixture } from "@/test/fixtures";
import { TOUR_KINDS } from "@/lib/tourKinds";
import { TripDataSchema, parseListFields, submitTripTool, unescapeBreaks } from "./submitTrip";

type JsonSchema = Record<string, unknown>;

/** Every object schema in the tool, nested ones included. */
function objects(schema: JsonSchema): JsonSchema[] {
  const children = [
    ...Object.values((schema.properties as Record<string, JsonSchema>) ?? {}),
    ...(schema.items ? [schema.items as JsonSchema] : []),
  ];
  return [...(schema.type === "object" ? [schema] : []), ...children.flatMap(objects)];
}

describe("submit_trip", () => {
  const schema = submitTripTool.input_schema as JsonSchema;

  it("closes every object and requires every property, as strict mode needs", () => {
    for (const object of objects(schema)) {
      expect(object.additionalProperties).toBe(false);
      expect(object.required).toEqual(Object.keys(object.properties as object));
    }
  });

  // Strict mode rejects length constraints; Zod enforces the counts instead.
  it("uses no length keywords", () => {
    expect(JSON.stringify(schema)).not.toMatch(/"(min|max)(Items|Length)"/);
  });

  it("asks for the same fields Zod checks, and not the traveller's own items", () => {
    expect(Object.keys(schema.properties as object).sort()).toEqual(
      Object.keys(TripDataSchema.shape).sort(),
    );
    expect(schema.properties).not.toHaveProperty("requiredItems");
  });

  it("offers the tour kinds as an enum", () => {
    const tours = (schema.properties as Record<string, JsonSchema>).tours;
    expect((tours.items as JsonSchema).properties).toMatchObject({
      kind: { type: "string", enum: [...TOUR_KINDS] },
    });
  });
});

describe("TripDataSchema", () => {
  it("accepts the fixture the e2e suite serves", () => {
    expect(TripDataSchema.safeParse(tripDataFixture).success).toBe(true);
  });

  it("wants exactly five tours and 6 to 15 items", () => {
    const tours = tripDataFixture.tours as unknown[];
    const items = tripDataFixture.objectsList as unknown[];
    const parse = (change: object) =>
      TripDataSchema.safeParse({ ...tripDataFixture, ...change }).success;

    expect(parse({ tours: [...tours, tours[0]] })).toBe(false);
    expect(parse({ objectsList: items.slice(0, 5) })).toBe(false);
    expect(parse({ objectsList: Array(16).fill(items[0]) })).toBe(false);
  });
});

describe("parseListFields", () => {
  const tours = tripDataFixture.tours as unknown[];

  it("parses a list sent as JSON text, and names it", () => {
    const { input, parsed } = parseListFields({ ...tripDataFixture, tours: JSON.stringify(tours) });

    expect(input).toEqual(tripDataFixture);
    expect(parsed).toEqual(["tours"]);
  });

  it("leaves lists that are already lists, and parses nothing", () => {
    expect(parseListFields(tripDataFixture)).toEqual({ input: tripDataFixture, parsed: [] });
  });

  it.each([
    ["prose", "the castle, then the tram"],
    ["broken JSON", '[{"title": "x"'],
    ["a JSON object", '{"title": "x"}'],
  ])("leaves %s as the string, for the schema to refuse", (_, value) => {
    const { input, parsed } = parseListFields({ ...tripDataFixture, tours: value });

    expect(input).toMatchObject({ tours: value });
    expect(parsed).toEqual([]);
    expect(TripDataSchema.safeParse(input).success).toBe(false);
  });

  it("touches no field but the lists", () => {
    const { input } = parseListFields({ ...tripDataFixture, title: "[1, 2]" });
    expect(input).toMatchObject({ title: "[1, 2]" });
  });

  it("passes through input that is not an object", () => {
    expect(parseListFields(null)).toEqual({ input: null, parsed: [] });
    expect(parseListFields("text")).toEqual({ input: "text", parsed: [] });
  });
});

describe("unescapeBreaks", () => {
  const tours = tripDataFixture.tours as { description: string }[];

  it("turns a written backslash and n into a line break in the description, the tip and the tours", () => {
    const trip = TripDataSchema.parse({
      ...tripDataFixture,
      description: "Tiled facades.\\n\\nLong light.",
      tip: "Book ahead.\\nCarry cash.",
      tours: tours.map((tour, i) => (i === 0 ? { ...tour, description: "Alfama.\\nAt dawn." } : tour)),
    });

    const clean = unescapeBreaks(trip);

    expect(clean.description).toBe("Tiled facades.\n\nLong light.");
    expect(clean.tip).toBe("Book ahead.\nCarry cash.");
    expect(clean.tours[0].description).toBe("Alfama.\nAt dawn.");
    expect(clean.tours.slice(1)).toEqual(trip.tours.slice(1));
  });

  it("leaves a trip without written breaks as it is", () => {
    const trip = TripDataSchema.parse(tripDataFixture);
    expect(unescapeBreaks(trip)).toEqual(trip);
  });
});
