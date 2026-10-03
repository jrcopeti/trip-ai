import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTripInDB,
  getAllTrips,
  getSingleSavedTrip,
} from "@/db/actions";
import prisma from "@/db";
import { tripCreateInput, tripFixture, tripFixture2 } from "@/test/fixtures";

vi.mock("@/db", () => ({
  default: {
    trip: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const trip = vi.mocked(prisma.trip);

beforeEach(() => {
  vi.mocked(trip.create).mockReset();
  vi.mocked(trip.findMany).mockReset();
  vi.mocked(trip.findUnique).mockReset();
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

describe("getAllTrips", () => {
  it("returns only saved trips when the search term is empty", async () => {
    vi.mocked(trip.findMany).mockResolvedValue([tripFixture, tripFixture2]);

    const result = await getAllTrips("");

    expect(trip.findMany).toHaveBeenCalledWith({
      where: { saved: true },
      orderBy: { city: "asc" },
    });
    expect(result).toHaveLength(2);
  });

  it("orders by city ascending", async () => {
    vi.mocked(trip.findMany).mockResolvedValue([]);

    await getAllTrips("");

    expect(trip.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { city: "asc" } }),
    );
  });

  it("searches city, country and userName case-insensitively", async () => {
    vi.mocked(trip.findMany).mockResolvedValue([tripFixture]);

    await getAllTrips("lisbon");

    expect(trip.findMany).toHaveBeenCalledWith({
      where: {
        saved: true,
        OR: [
          { city: { contains: "lisbon", mode: "insensitive" } },
          { country: { contains: "lisbon", mode: "insensitive" } },
          { userName: { contains: "lisbon", mode: "insensitive" } },
        ],
      },
      orderBy: { city: "asc" },
    });
  });

  it("keeps the saved filter alongside the search", async () => {
    vi.mocked(trip.findMany).mockResolvedValue([]);

    await getAllTrips("kyoto");

    const where = vi.mocked(trip.findMany).mock.calls[0][0]?.where;
    expect(where).toMatchObject({ saved: true });
  });

  it("returns an empty list when nothing matches", async () => {
    vi.mocked(trip.findMany).mockResolvedValue([]);

    await expect(getAllTrips("atlantis")).resolves.toEqual([]);
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
