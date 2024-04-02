/*
  Warnings:

  - Added the required column `agreement` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `budget` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Trip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "agreement" BOOLEAN NOT NULL,
ADD COLUMN     "budget" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Type";

-- CreateTable
CREATE TABLE "TripResponse" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectsList" JSONB[],
    "mustHave" TEXT[],
    "countryCode" TEXT NOT NULL,
    "tours" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tripId" INTEGER NOT NULL,

    CONSTRAINT "TripResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripResponse_tripId_key" ON "TripResponse"("tripId");
