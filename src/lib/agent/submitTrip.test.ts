import { describe, expect, it } from "vitest";
import { tripDataFixture } from "@/test/fixtures";
import { TOUR_KINDS } from "@/lib/tourKinds";
import { TripDataSchema, submitTripTool } from "./submitTrip";

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
