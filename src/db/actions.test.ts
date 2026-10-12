import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTripInDB,
  getLatestSavedTrips,
  getSavedTripsPage,
  getSingleSavedTrip,
} from "@/db/actions";
import prisma from "@/db";
import { tripCreateInput, tripFixture, tripFixture2 } from "@/test/fixtures";
import { SAVED_TRIPS_PAGE_SIZE } from "@/lib/constants";

vi.mock("@/db", () => ({
  default: {
    trip: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const trip = vi.mocked(prisma.trip);

beforeEach(() => {
  vi.mocked(trip.create).mockReset();
  vi.mocked(trip.findMany).mockReset();
  vi.mocked(trip.findUnique).mockReset();
  vi.mocked(trip.count).mockReset();
});

describe("createTripInDB", () => {
  it("writes the trip it is handed", async () => {
    const input = tripCreateInput();
    vi.mocked(trip.create).mockResolvedValue(tripFixture);

    const result = await createTripInDB(input);

    expect(trip.create).toHaveBeenCalledWith({ data: input });
    expect(result).toEqual(tripFixture);
  });

  it("writes discarded trips too, flagged unsaved", async () => {
    const discarded = { ...tripCreateInput(), saved: false };
    vi.mocked(trip.create).mockResolvedValue({ ...tripFixture, saved: false });

    await createTripInDB(discarded);

    expect(trip.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ saved: false }),
    });
  });

  it("propagates a write failure rather than swallowing it", async () => {
    vi.mocked(trip.create).mockRejectedValue(new Error("connection refused"));

    await expect(createTripInDB(tripCreateInput())).rejects.toThrow(
      "connection refused",
    );
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
        image: true,
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

describe("getSingleSavedTrip", () => {
  it("looks a trip up by id, saved only", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(tripFixture);

    const result = await getSingleSavedTrip(1);

    expect(trip.findUnique).toHaveBeenCalledWith({
      where: { id: 1, saved: true },
    });
    expect(result).toEqual(tripFixture);
  });

  it("returns null for a miss", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(null);

    await expect(getSingleSavedTrip(999)).resolves.toBeNull();
  });

  it("returns null for an unsaved trip — the saved filter is part of the lookup", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(null);

    const result = await getSingleSavedTrip(2);

    expect(trip.findUnique).toHaveBeenCalledWith({
      where: { id: 2, saved: true },
    });
    expect(result).toBeNull();
  });

  it("passes an undefined id straight through", async () => {
    vi.mocked(trip.findUnique).mockResolvedValue(null);

    await expect(getSingleSavedTrip(undefined)).resolves.toBeNull();
    expect(trip.findUnique).toHaveBeenCalledWith({
      where: { id: undefined, saved: true },
    });
  });
});
