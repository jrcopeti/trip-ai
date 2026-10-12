import { beforeEach, describe, expect, it, vi } from "vitest";
import { tripDataFixture } from "@/test/fixtures";

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

  it("asks for each tour as a title and a description", async () => {
    await fetchResponseAI("a prompt");

    const tours = sentTool().input_schema.properties.tours;
    expect(tours.items).toMatchObject({
      type: "object",
      properties: { title: { type: "string" }, description: { type: "string" } },
      required: ["title", "description"],
    });
  });

  it("returns null when the tool says the city does not exist", async () => {
    create.mockResolvedValue({
      content: [{ type: "tool_use", name: "tripData", input: { trip: null } }],
    });

    await expect(fetchResponseAI("a prompt")).resolves.toBeNull();
  });
});
