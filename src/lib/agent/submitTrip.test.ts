import { describe, expect, it } from "vitest";
import { tripDataFixture } from "@/test/fixtures";
import { TOUR_KINDS } from "@/lib/tourKinds";
import { TripDataSchema, parseListFields, submitTripTool } from "./submitTrip";

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

  it("lists the fields in the prompt's order, tours first", () => {
    const order = ["tours", "objectsList", "mustHave", "title", "description", "tip"];
    expect(Object.keys(schema.properties as object)).toEqual(order);
    expect(submitTripTool.description).toMatch(/^Submit the finished trip: five tours, packing list, must-haves, title, description and a tip\./);
  });

  it("offers the tour kinds as an enum", () => {
    const tours = (schema.properties as Record<string, JsonSchema>).tours;
    expect((tours.items as JsonSchema).properties).toMatchObject({
      kind: { type: "string", enum: [...TOUR_KINDS] },
    });
  });

  // 2l: a written "\n" showed in the tip as a backslash and an n.
  it("asks for real line breaks in every prose field, not the characters backslash and n", () => {
    const fields = schema.properties as Record<string, JsonSchema>;
    const tour = (fields.tours.items as JsonSchema).properties as Record<string, JsonSchema>;
    for (const field of [fields.description, fields.tip, tour.description]) {
      expect(field.description).toContain("not the characters backslash and n");
    }
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
    expect(parseListFields(tripDataFixture)).toEqual({
      input: tripDataFixture,
      parsed: [],
      broken: {},
    });
  });

  it.each([
    ["prose", "the castle, then the tram"],
    ["broken JSON", '[{"title": "x"'],
    ["a JSON object", '{"title": "x"}'],
  ])("leaves %s as the string, for the schema to refuse, and names it as broken", (_, value) => {
    const { input, parsed, broken } = parseListFields({ ...tripDataFixture, tours: value });

    expect(input).toMatchObject({ tours: value });
    expect(parsed).toEqual([]);
    expect(broken).toEqual({ tours: value });
    expect(TripDataSchema.safeParse(input).success).toBe(false);
  });

  it("touches no field but the lists", () => {
    const { input, broken } = parseListFields({ ...tripDataFixture, title: "[1, 2]" });
    expect(input).toMatchObject({ title: "[1, 2]" });
    expect(broken).toEqual({});
  });

  it("passes through input that is not an object", () => {
    expect(parseListFields(null)).toEqual({ input: null, parsed: [], broken: {} });
    expect(parseListFields("text")).toEqual({ input: "text", parsed: [], broken: {} });
  });
});
