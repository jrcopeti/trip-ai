import { afterEach, describe, expect, it, vi } from "vitest";
import { getLatestSavedTrips } from "@/db/actions";
import { tripFixture, tripFixture2 } from "@/test/fixtures";
import loadLatestTrips, { LATEST_TRIPS_TIMEOUT_MS } from "./loadLatestTrips";

vi.mock("@/db/actions", () => ({ getLatestSavedTrips: vi.fn() }));

afterEach(() => {
  vi.mocked(getLatestSavedTrips).mockReset();
  vi.restoreAllMocks();
  vi.useRealTimers();
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

  it("gives up on a slow database after the limit, and logs it", async () => {
    vi.useFakeTimers();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    // A query that never answers: a sleeping or unreachable database.
    vi.mocked(getLatestSavedTrips).mockReturnValue(new Promise(() => {}));

    const result = loadLatestTrips();
    await vi.advanceTimersByTimeAsync(LATEST_TRIPS_TIMEOUT_MS);

    await expect(result).resolves.toEqual([]);
    expect(log).toHaveBeenCalledOnce();
  });

  it("still deals the trips when they arrive just inside the limit", async () => {
    vi.useFakeTimers();
    vi.mocked(getLatestSavedTrips).mockReturnValue(
      new Promise((resolve) =>
        setTimeout(() => resolve([tripFixture]), LATEST_TRIPS_TIMEOUT_MS - 1),
      ),
    );

    const result = loadLatestTrips();
    await vi.advanceTimersByTimeAsync(LATEST_TRIPS_TIMEOUT_MS);

    await expect(result).resolves.toEqual([tripFixture]);
  });

  it("sets the limit at a second and a half", () => {
    expect(LATEST_TRIPS_TIMEOUT_MS).toBe(1500);
  });
});
