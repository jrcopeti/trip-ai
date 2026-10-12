import { afterEach, describe, expect, it, vi } from "vitest";
import { getLatestSavedTrips } from "@/db/actions";
import { tripFixture, tripFixture2 } from "@/test/fixtures";
import loadLatestTrips from "./loadLatestTrips";

vi.mock("@/db/actions", () => ({ getLatestSavedTrips: vi.fn() }));

afterEach(() => {
  vi.mocked(getLatestSavedTrips).mockReset();
  vi.restoreAllMocks();
});

describe("loadLatestTrips", () => {
  it("passes the latest saved trips through", async () => {
    vi.mocked(getLatestSavedTrips).mockResolvedValue([tripFixture2, tripFixture]);

    await expect(loadLatestTrips()).resolves.toEqual([tripFixture2, tripFixture]);
  });

  it("treats a database error as no trips, and logs it", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("connection refused");
    vi.mocked(getLatestSavedTrips).mockRejectedValue(failure);

    await expect(loadLatestTrips()).resolves.toEqual([]);
    expect(log).toHaveBeenCalledWith(expect.any(String), failure);
  });
});
