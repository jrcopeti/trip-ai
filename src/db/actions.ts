"use server";
import { Prisma, Trip } from "@prisma/client";
import prisma from "@/db";
import { SAVED_TRIPS_PAGE_SIZE, TRIP_URL } from "@/lib/constants";

/**
 * The traveller's answer to "save this trip?". `generateTrip` already wrote the row, so
 * this only flips the flag, and only once: a saved trip can't be unsaved by its url.
 */
export const setTripSaved = async (tripUrl: string, saved: boolean): Promise<void> => {
  if (!TRIP_URL.test(tripUrl) || typeof saved !== "boolean") {
    throw new Error("Not a trip url and an answer");
  }
  const { count } = await prisma.trip.updateMany({
    where: { tripUrl, saved: false },
    data: { saved },
  });
  if (count === 0) throw new Error("No unsaved trip at that url");
};

export type SavedTripsPage = {
  trips: Trip[];
  /** Every saved trip matching the search, not just this page. */
  total: number;
};

/**
 * One page of saved trips matching `searchTerm`, plus the total to page through.
 * The page size is fixed here rather than taken from the caller, so a client
 * cannot ask for the whole table in one go.
 */
export const getSavedTripsPage = async (
  searchTerm: string,
  page: number,
): Promise<SavedTripsPage> => {
  const whereClause: Prisma.TripWhereInput = {
    saved: true,
    ...(searchTerm && {
      OR: [
        {
          city: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          country: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          userName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    }),
  };
  const safePage = Number.isInteger(page) && page > 0 ? page : 0;

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where: whereClause,
      // `id` breaks ties: several trips share a city, and without a total
      // order `skip` could show one of them on two pages and another on none.
      orderBy: [{ city: "asc" }, { id: "asc" }],
      skip: safePage * SAVED_TRIPS_PAGE_SIZE,
      take: SAVED_TRIPS_PAGE_SIZE,
    }),
    prisma.trip.count({ where: whereClause }),
  ]);

  return { trips, total };
};

/** What the landing's hero deck needs of a trip: a polaroid's worth, no more. */
export type LatestTrip = Pick<
  Trip,
  "id" | "city" | "country" | "userName" | "tripImages" | "placeholder"
>;

/**
 * The three most recently saved trips, newest first, for the landing's hero.
 * Fixed at three for the same reason the saved-trips page size is fixed here.
 */
export const getLatestSavedTrips = async (): Promise<LatestTrip[]> => {
  return prisma.trip.findMany({
    where: { saved: true },
    // `id` breaks ties: rows written in one statement share a `createdAt`.
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
};

/** The trip at `/trips/[tripUrl]`, saved or not; null for a url `generateTrip` never makes. */
export const getTripByUrl = async (tripUrl: string): Promise<Trip | null> => {
  if (!TRIP_URL.test(tripUrl)) return null;
  return prisma.trip.findUnique({ where: { tripUrl } });
};

// A Postgres `Int`: anything longer, or not digits, is a Prisma error rather than no row.
const TRIP_ID = /^[1-9]\d{0,9}$/;
const MAX_INT = 2_147_483_647;

/** The saved trip at `/saved-trips/[id]`, from the route's own string. */
export const getSingleSavedTrip = async (id: string): Promise<Trip | null> => {
  if (!TRIP_ID.test(id) || Number(id) > MAX_INT) return null;
  return prisma.trip.findUnique({
    where: {
      id: Number(id),
      saved: true,
    },
  });
};
