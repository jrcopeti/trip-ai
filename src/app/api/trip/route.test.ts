import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { generateTrip } from "@/app/api/anthropicApi";
import { generatedTripFixture, validTripRequest } from "@/test/fixtures";

vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));

const mockGenerate = vi.mocked(generateTrip);

const post = (body: string) =>
  POST(new Request("http://localhost/api/trip", { method: "POST", body }));

beforeEach(() => {
  mockGenerate.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/trip", () => {
  it("generates the trip from the body and answers its url", async () => {
    mockGenerate.mockResolvedValue(generatedTripFixture);

    const response = await post(JSON.stringify(validTripRequest));

    expect(mockGenerate).toHaveBeenCalledWith(validTripRequest);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ tripUrl: generatedTripFixture.tripUrl });
  });

  it("answers 500, and logs, when generation fails", async () => {
    mockGenerate.mockRejectedValue(new Error("The model did not return a trip"));

    const response = await post(JSON.stringify(validTripRequest));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "The trip could not be generated" });
    expect(console.error).toHaveBeenCalled();
  });

  it("answers 400 to a body that isn't JSON, without generating", async () => {
    const response = await post("{not json");

    expect(response.status).toBe(400);
    expect(mockGenerate).not.toHaveBeenCalled();
  });
});
