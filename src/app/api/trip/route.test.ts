import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { generateTrip } from "@/app/api/anthropicApi";
import { generatedTripFixture, validTripRequest } from "@/test/fixtures";

vi.mock("@/app/api/anthropicApi", () => ({ generateTrip: vi.fn() }));

const mockGenerate = vi.mocked(generateTrip);

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://localhost/api/trip", {
      method: "POST",
      body,
      headers: { "content-type": "application/json", ...headers },
    }),
  );

beforeEach(() => {
  mockGenerate.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/trip", () => {
  it("generates the trip from the body and answers its url", async () => {
    mockGenerate.mockResolvedValue(generatedTripFixture);

    const response = await post(JSON.stringify(validTripRequest));

    expect(mockGenerate).toHaveBeenCalledWith(validTripRequest, expect.any(AbortSignal));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ tripUrl: generatedTripFixture.tripUrl });
  });

  it("hands generation the request's signal, so a disconnect aborts it", async () => {
    mockGenerate.mockResolvedValue(generatedTripFixture);
    const client = new AbortController();

    await POST(
      new Request("http://localhost/api/trip", {
        method: "POST",
        body: JSON.stringify(validTripRequest),
        headers: { "content-type": "application/json" },
        signal: client.signal,
      }),
    );
    const signal = mockGenerate.mock.calls[0][1]!;
    expect(signal.aborted).toBe(false);
    client.abort();

    expect(signal.aborted).toBe(true);
  });

  it("logs nothing when generation fails because the client has gone", async () => {
    const client = new AbortController();
    mockGenerate.mockImplementation(async () => {
      client.abort();
      throw new Error("Request was aborted.");
    });

    await POST(
      new Request("http://localhost/api/trip", {
        method: "POST",
        body: JSON.stringify(validTripRequest),
        headers: { "content-type": "application/json" },
        signal: client.signal,
      }),
    );

    expect(console.error).not.toHaveBeenCalled();
  });

  it("answers 500, and logs, when generation fails", async () => {
    mockGenerate.mockRejectedValue(new Error("The model did not return a trip"));

    const response = await post(JSON.stringify(validTripRequest));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "The trip could not be generated" });
    expect(console.error).toHaveBeenCalled();
  });

  // A cross-site page's simple request (text/plain, no preflight) must not run a generation.
  it("answers 415 to a body not sent as JSON, without generating", async () => {
    const response = await post(JSON.stringify(validTripRequest), { "content-type": "text/plain" });

    expect(response.status).toBe(415);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  // What the browser sends with the app's own fetch; a page can't set or forge it.
  it("accepts a same-origin request", async () => {
    mockGenerate.mockResolvedValue(generatedTripFixture);

    const response = await post(JSON.stringify(validTripRequest), { "sec-fetch-site": "same-origin" });

    expect(response.status).toBe(200);
  });

  it.each(["cross-site", "same-site", "none"])(
    "answers 403 to a request the browser marks %s, without generating",
    async (site) => {
      const response = await post(JSON.stringify(validTripRequest), { "sec-fetch-site": site });

      expect(response.status).toBe(403);
      expect(mockGenerate).not.toHaveBeenCalled();
    },
  );

  // No browser said where it came from (curl, a server); the content type still has to be JSON.
  it("accepts a request without Sec-Fetch-Site", async () => {
    mockGenerate.mockResolvedValue(generatedTripFixture);

    const response = await post(JSON.stringify(validTripRequest));

    expect(response.status).toBe(200);
  });

  it("takes JSON whatever the content type's case", async () => {
    mockGenerate.mockResolvedValue(generatedTripFixture);

    const response = await post(JSON.stringify(validTripRequest), {
      "content-type": "Application/JSON; charset=utf-8",
    });

    expect(response.status).toBe(200);
  });

  it("answers 400 to JSON that isn't a valid trip request, without generating", async () => {
    const response = await post(JSON.stringify({ ...validTripRequest, travellers: "a crowd" }));

    expect(response.status).toBe(400);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("answers 400 to a body that isn't JSON, without generating", async () => {
    const response = await post("{not json");

    expect(response.status).toBe(400);
    expect(mockGenerate).not.toHaveBeenCalled();
  });
});
