"use server";
import { Prisma, Trip } from "@prisma/client";
import prisma from "@/db";

export const createTripInDB = async (trip: Prisma.TripCreateInput) => {
  return prisma.trip.create({
    data: trip,
  });
};

export const getAllTrips = async (searchTerm: string): Promise<Trip[]> => {
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

  const allTrips = await prisma.trip.findMany({
    where: whereClause,
    orderBy: {
      city: "asc",
    },
  });
  return allTrips;
};

export const getSingleSavedTrip = async (id: number | undefined) => {
  return prisma.trip.findUnique({
    where: {
      id,
      saved: true,
    },
  });
};
