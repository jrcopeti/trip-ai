/*
  Warnings:

  - You are about to drop the `TripResponse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `countryCode` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objectsList` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tours` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "mustHave" TEXT[],
ADD COLUMN     "objectsList" JSONB NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "tours" JSONB NOT NULL,
ALTER COLUMN "weatherForecast" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "TripResponse";
