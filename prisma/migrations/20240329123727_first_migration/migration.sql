-- CreateEnum
CREATE TYPE "Reason" AS ENUM ('family', 'adventure', 'romantic', 'solo', 'business');

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "title" TEXT,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "accommodation" TEXT NOT NULL,
    "reason" "Reason" NOT NULL,
    "activities" JSONB,
    "preferences" JSONB,
    "notes" TEXT NOT NULL,
    "countryFlag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);
