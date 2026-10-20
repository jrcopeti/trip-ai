import { afterEach, describe, expect, it, vi } from "vitest";
import { requestTrip } from "./requestTrip";
import { validTripRequest } from "@/test/fixtures";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestTrip", () => {
  it("posts the request as JSON, with the signal, and resolves to the url", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ tripUrl: "a1b2c3d4e5f6" }));
    vi.stubGlobal("fetch", fetchMock);
    const { signal } = new AbortController();

    await expect(requestTrip(validTripRequest, signal)).resolves.toEqual({ tripUrl: "a1b2c3d4e5f6" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/trip");
    expect(init).toMatchObject({ method: "POST", signal });
    expect(JSON.parse(init.body)).toEqual(validTripRequest);
  });

  it("rejects a success without a trip url, rather than open /trips/undefined", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ok: true })));

    await expect(requestTrip(validTripRequest, new AbortController().signal)).rejects.toThrow();
  });

  it("rejects on an error status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 500 })));

    await expect(requestTrip(validTripRequest, new AbortController().signal)).rejects.toThrow(
      "(500)",
    );
  });
});
