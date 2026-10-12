import { beforeEach, describe, expect, it, vi } from "vitest";
import { tripDataFixture } from "@/test/fixtures";
import { TOUR_KINDS } from "@/lib/tourKinds";

const create = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {
    status = 500;
  }
  class Anthropic {
    static APIError = APIError;
    messages = { create };
  }
  return { default: Anthropic };
});

const { fetchResponseAI } = await import("./anthropicApi");

/** The `tripData` tool as the last call sent it. */
function sentTool() {
  const [{ tools }] = create.mock.calls.at(-1)!;
  return tools[0];
}

beforeEach(() => {
  create.mockReset();
  create.mockResolvedValue({
    content: [{ type: "tool_use", name: "tripData", input: tripDataFixture }],
  });
});

describe("fetchResponseAI", () => {
  it("forces the tripData tool and returns its input", async () => {
    await expect(fetchResponseAI("a prompt")).resolves.toEqual(tripDataFixture);

    expect(create.mock.calls.at(-1)![0].tool_choice).toEqual({ type: "tool", name: "tripData" });
  });

  it("asks for each tour as a title, a one-word kind from the list, and a description", async () => {
    await fetchResponseAI("a prompt");

    const tours = sentTool().input_schema.properties.tours;
    expect(tours.items).toMatchObject({
      type: "object",
      properties: {
        title: { type: "string" },
        kind: { type: "string", enum: [...TOUR_KINDS] },
        description: { type: "string" },
      },
      required: ["title", "kind", "description"],
    });
    TOUR_KINDS.forEach((kind) => expect(kind).toMatch(/^[A-Z][a-z]+$/));
  });

  it("asks for five tours", async () => {
    await fetchResponseAI("a prompt");

    const { system } = create.mock.calls.at(-1)![0];
    const tours = sentTool().input_schema.properties.tours;
    expect(tours).toMatchObject({ minItems: 5, maxItems: 5 });
    expect(tours.description).toMatch(/\bfive\b/i);
    expect(system[0].text).toMatch(/\bfive\b/i);
    expect(system[0].text).not.toMatch(/\bthree (specific )?activities\b/i);
  });

  it("returns null when the tool says the city does not exist", async () => {
    create.mockResolvedValue({
      content: [{ type: "tool_use", name: "tripData", input: { trip: null } }],
    });

    await expect(fetchResponseAI("a prompt")).resolves.toBeNull();
  });
});
