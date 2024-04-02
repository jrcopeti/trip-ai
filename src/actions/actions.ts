"use server";
import type { Trip } from "@prisma/client";
import { FormDataSchema } from "@/lib/schema";

type FormDataSchema = typeof FormDataSchema;

import prisma from "@/db";

export const createTripInDB = async (trip: any) => {
  console.log("trip is being created");
  return prisma.trip.create({
    data: trip,
  });
};

export const getAllTrips = async () => {
  const allTrips = await prisma.trip.findMany({
    where: {
      saved: true,
    },
    orderBy: {
      city: "asc",
    },
  });
  return allTrips;
};

export const getSingleSavedTrip = async (id: number | string ) => {
  return prisma.trip.findUnique({
    where: {
      id,
    },
  });
};
