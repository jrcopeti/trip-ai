import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getLatestSavedTrips,
  getSavedTripsPage,
  getSingleSavedTrip,
  getTripByUrl,
  isTripOpen,
  setTripSaved,
} from "@/db/actions";
import prisma from "@/db";
import { generatedTripFixture, tripFixture, tripFixture2 } from "@/test/fixtures";
import { SAVED_TRIPS_PAGE_SIZE } from "@/lib/constants";

vi.mock("@/db", () => ({
  default: {
    trip: {
      updateMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const trip = vi.mocked(prisma.trip);

beforeEach(() => {
  vi.mocked(trip.updateMany).mockReset();
  vi.mocked(trip.findMany).mockReset();
  vi.mocked(trip.findUnique).mockReset();
  vi.mocked(trip.count).mockReset();
});

describe("setTripSaved", () => {
  const url = "0a1b2c3d4e5f";

  it.each([true, false])("flips an unsaved trip's flag to %s, and only that", async (saved) => {
    vi.mocked(trip.updateMany).mockResolvedValue({ count: 1 });

    await expect(setTripSaved(url, saved)).resolves.toBeUndefined();
    expect(trip.updateMany).toHaveBeenCalledWith({
      where: { tripUrl: url, saved: false },
      data: { saved },
    });
  });

  it("fails when there is no unsaved trip at the url, so a saved one can't be unsaved", async () => {
    vi.mocked(trip.updateMany).mockResolvedValue({ count: 0 });

    await expect(setTripSaved(url, false)).rejects.toThrow("No unsaved trip");
  });

  it.each([
    ["a short url", "ab12c", true],
    ["a url with a filter in it", { not: "" }, true],
    ["an answer that isn't a boolean", url, "yes"],
  ])("refuses %s before touching the table", async (_, tripUrl, saved) => {
    await expect(setTripSaved(tripUrl as string, saved as boolean)).rejects.toThrow();
    expect(trip.updateMany).not.toHaveBeenCalled();
  });
});

describe("getSavedTripsPage", () => {
  const ORDER = [{ city: "asc" }, { id: "asc" }];

  function resolve(trips = [tripFixture, tripFixture2], total = trips.length) {
    vi.mocked(trip.findMany).mockResolvedValue(trips);
    vi.mocked(trip.count).mockResolvedValue(total);
  }

  it("returns the first page of saved trips and the total", async () => {
    resolve([tripFixture, tripFixture2], 74);

    const result = await getSavedTripsPage("", 0);

    expect(trip.findMany).toHaveBeenCalledWith({
      where: { saved: true },
      orderBy: ORDER,
      skip: 0,
      take: SAVED_TRIPS_PAGE_SIZE,
    });
    expect(result).toEqual({ trips: [tripFixture, tripFixture2], total: 74 });
  });

  it("counts with the same filter as the page", async () => {
    resolve();

    await getSavedTripsPage("lisbon", 0);

    const where = vi.mocked(trip.findMany).mock.calls[0][0]?.where;
    expect(trip.count).toHaveBeenCalledWith({ where });
  });

  it("skips whole pages", async () => {
    resolve();

    await getSavedTripsPage("", 2);

    expect(trip.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 2 * SAVED_TRIPS_PAGE_SIZE, take: SAVED_TRIPS_PAGE_SIZE }),
    );
  });

  it("breaks ties on id, so trips sharing a city cannot repeat across pages", async () => {
    resolve();

    await getSavedTripsPage("", 1);

    expect(trip.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: ORDER }));
  });

  it.each([-1, 1.5, Number.NaN])("treats a bad page (%s) as the first", async (page) => {
    resolve();

    await getSavedTripsPage("", page);

    expect(trip.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0 }));
  });

  it("searches city, country and userName case-insensitively", async () => {
    resolve([tripFixture]);

    await getSavedTripsPage("lisbon", 0);

    expect(trip.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          saved: true,
          OR: [
            { city: { contains: "lisbon", mode: "insensitive" } },
            { country: { contains: "lisbon", mode: "insensitive" } },
            { userName: { contains: "lisbon", mode: "insensitive" } },
          ],
        },
      }),
    );
  });

  it("keeps the saved filter alongside the search", async () => {
    resolve([]);

    await getSavedTripsPage("kyoto", 0);

    const where = vi.mocked(trip.findMany).mock.calls[0][0]?.where;
    expect(where).toMatchObject({ saved: true });
  });

  it("returns an empty page when nothing matches", async () => {
    resolve([], 0);

    await expect(getSavedTripsPage("atlantis", 0)).resolves.toEqual({ trips: [], total: 0 });
  });
});

describe("getLatestSavedTrips", () => {
  it("asks for the three newest saved trips, newest first, ties broken by id", async () => {
    vi.mocked(trip.findMany).mockResolvedValue([tripFixture2, tripFixture]);

    const result = await getLatestSavedTrips();

    expect(trip.findMany).toHaveBeenCalledWith({
      where: { saved: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 3,
      select: {
        id: true,
        city: true,
        country: true,
        userName: true,
        tripImages: true,
        placeholder: true,
      },
    });
    expect(result).toEqual([tripFixture2, tripFixture]);
  });

  it("propagates a read failure, for the caller to decide", async () => {
    vi.mocked(trip.findMany).mockRejectedValue(new Error("connection refused"));

    await expect(getLatestSavedTrips()).rejects.toThrow("connection refused");
  });
});

describe("getTripByUrl", () => {
  it("looks the trip up by its url, saved or not", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(generatedTripFixture);

    await expect(getTripByUrl(generatedTripFixture.tripUrl)).resolves.toEqual(
      generatedTripFixture,
    );
    expect(trip.findUnique).toHaveBeenCalledWith({
      where: { tripUrl: generatedTripFixture.tripUrl },
    });
  });

  it("returns null for a miss", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(null);

    await expect(getTripByUrl("ffffffffffff")).resolves.toBeNull();
  });

  it.each(["0a1b2c", "0A1B2C3D4E5F", "0a1b2c3d4e5f0", "' or 1=1 --"])(
    "returns null for %j without a query",
    async (tripUrl) => {
      await expect(getTripByUrl(tripUrl)).resolves.toBeNull();
      expect(trip.findUnique).not.toHaveBeenCalled();
    },
  );
});

describe("isTripOpen", () => {
  it("reads only the flag, and is true for an unsaved row", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue({ saved: false } as never);

    await expect(isTripOpen(generatedTripFixture.tripUrl)).resolves.toBe(true);
    expect(trip.findUnique).toHaveBeenCalledWith({
      where: { tripUrl: generatedTripFixture.tripUrl },
      select: { saved: true },
    });
  });

  it("is false for a saved row", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue({ saved: true } as never);
    await expect(isTripOpen(generatedTripFixture.tripUrl)).resolves.toBe(false);
  });

  it("is false for a miss", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(null);
    await expect(isTripOpen("ffffffffffff")).resolves.toBe(false);
  });

  it.each(["0a1b2c", "0A1B2C3D4E5F", "' or 1=1 --"])("is false for %j without a query", async (tripUrl) => {
    await expect(isTripOpen(tripUrl)).resolves.toBe(false);
    expect(trip.findUnique).not.toHaveBeenCalled();
  });
});

describe("getSingleSavedTrip", () => {
  it("looks a trip up by the route's id, saved only", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(tripFixture);

    const result = await getSingleSavedTrip("1");

    expect(trip.findUnique).toHaveBeenCalledWith({
      where: { id: 1, saved: true },
    });
    expect(result).toEqual(tripFixture);
  });

  it("returns null for a miss", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(null);

    await expect(getSingleSavedTrip("999")).resolves.toBeNull();
  });

  it("returns null for an unsaved trip — the saved filter is part of the lookup", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(null);

    const result = await getSingleSavedTrip("2");

    expect(trip.findUnique).toHaveBeenCalledWith({
      where: { id: 2, saved: true },
    });
    expect(result).toBeNull();
  });

  // Each was a Prisma validation error, so a 500, rather than the route's not-found page.
  it.each(["abc", "", "0", "-1", "1.5", "1e3", "2147483648", "99999999999"])(
    "returns null for %j without a query",
    async (id) => {
      await expect(getSingleSavedTrip(id)).resolves.toBeNull();
      expect(trip.findUnique).not.toHaveBeenCalled();
    },
  );

  it("still reads the largest id Postgres can hold", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(null);

    await getSingleSavedTrip("2147483647");

    expect(trip.findUnique).toHaveBeenCalledWith({
      where: { id: 2147483647, saved: true },
    });
  });
});
