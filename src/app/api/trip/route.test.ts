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
      headers: { host: "localhost", "content-type": "application/json", ...headers },
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

  // A cross-site page's simple request (text/plain, no preflight) must not run a generation.
  it("answers 415 to a body not sent as JSON, without generating", async () => {
    const response = await post(JSON.stringify(validTripRequest), { "content-type": "text/plain" });

    expect(response.status).toBe(415);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("answers 403 to a request from another origin, without generating", async () => {
    const response = await post(JSON.stringify(validTripRequest), { origin: "https://elsewhere.example" });

    expect(response.status).toBe(403);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("accepts its own origin, and the forwarded host a proxy sets", async () => {
    mockGenerate.mockResolvedValue(generatedTripFixture);

    const own = await post(JSON.stringify(validTripRequest), { origin: "http://localhost" });
    const proxied = await post(JSON.stringify(validTripRequest), {
      origin: "https://trip.example",
      "x-forwarded-host": "trip.example",
    });

    expect(own.status).toBe(200);
    expect(proxied.status).toBe(200);
  });

  it("answers 403, not a crash, to the opaque origin a sandboxed page sends", async () => {
    const response = await post(JSON.stringify(validTripRequest), { origin: "null" });

    expect(response.status).toBe(403);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  // Behind chained proxies the header is a list; the first entry is the host the browser asked for.
  it("compares the origin with the first of several forwarded hosts", async () => {
    mockGenerate.mockResolvedValue(generatedTripFixture);

    const response = await post(JSON.stringify(validTripRequest), {
      origin: "https://trip.example",
      "x-forwarded-host": "trip.example, internal.lb",
    });

    expect(response.status).toBe(200);
  });

  it("falls back to the host when the forwarded host is empty", async () => {
    mockGenerate.mockResolvedValue(generatedTripFixture);

    const response = await post(JSON.stringify(validTripRequest), {
      origin: "http://localhost",
      "x-forwarded-host": "",
    });

    expect(response.status).toBe(200);
  });

  it("answers 403 when there's no host to compare an origin with", async () => {
    const request = new Request("http://localhost/api/trip", {
      method: "POST",
      body: JSON.stringify(validTripRequest),
      headers: { "content-type": "application/json", origin: "null" },
    });
    request.headers.delete("host");

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(mockGenerate).not.toHaveBeenCalled();
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
