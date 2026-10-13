import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { geoNamesSearchFixture } from "@/test/fixtures";

const fetchMock = vi.fn();
const { resolvePlace } = await import("./geoNamesApi");

function answer(body: unknown, status = 200) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GEONAMES_USERNAME", "trip-ai");
  vi.spyOn(console, "error").mockImplementation(() => {});
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("resolvePlace", () => {
  it("searches populated places, all names, most populous first, with the server's username", async () => {
    answer(geoNamesSearchFixture);
    await resolvePlace("Lisboa", "PT");

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe("https://secure.geonames.org/searchJSON");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      q: "Lisboa",
      country: "PT",
      featureClass: "P",
      style: "FULL",
      orderby: "population",
      username: "trip-ai",
    });
  });

  it("returns the canonical place", async () => {
    answer(geoNamesSearchFixture);
    await expect(resolvePlace("  Lisboa ", "PT")).resolves.toEqual({
      ok: true,
      place: {
        name: "Lisbon",
        country: "Portugal",
        lat: 38.71667,
        lng: -9.13333,
        timezone: "Europe/Lisbon",
        geonameId: 2267057,
      },
    });
  });

  it("returns not-found when nothing matches", async () => {
    answer({ totalResultsCount: 0, geonames: [] });
    await expect(resolvePlace("Atlantis", "PT")).resolves.toEqual({
      ok: false,
      error: "not-found",
    });
  });

  it("rejects bad input without calling GeoNames", async () => {
    await expect(resolvePlace("Li", "PT")).resolves.toEqual({ ok: false, error: "not-found" });
    await expect(resolvePlace("Lisbon", "Portugal")).resolves.toEqual({
      ok: false,
      error: "not-found",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns unavailable when GeoNames answers with an error status", async () => {
    // A bad username or exhausted quota still comes back as HTTP 200.
    answer({ status: { message: "user does not exist.", value: 10 } });
    await expect(resolvePlace("Lisbon", "PT")).resolves.toEqual({
      ok: false,
      error: "unavailable",
    });
  });

  it("returns unavailable when the request fails", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    await expect(resolvePlace("Lisbon", "PT")).resolves.toEqual({
      ok: false,
      error: "unavailable",
    });
  });
});
