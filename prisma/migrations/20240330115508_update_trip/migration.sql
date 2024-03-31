/*
  Warnings:

  - You are about to drop the column `EndDate` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `activities` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `countryFlag` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `city` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lugaggeSize` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tours` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Trip` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('family', 'adventure', 'romantic', 'solo', 'business', 'cultural', 'beach', 'festival', 'gastronomy', 'nature');

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "EndDate",
DROP COLUMN "activities",
DROP COLUMN "countryFlag",
DROP COLUMN "destination",
DROP COLUMN "notes",
DROP COLUMN "preferences",
DROP COLUMN "reason",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "lugaggeSize" TEXT NOT NULL,
ADD COLUMN     "mustHave" TEXT[],
ADD COLUMN     "nationality" TEXT NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "objectsList" JSONB[],
ADD COLUMN     "requiredItems" JSONB,
ADD COLUMN     "tours" JSONB NOT NULL,
ADD COLUMN     "type" "Type" NOT NULL,
ADD COLUMN     "weatherForecast" JSONB,
ALTER COLUMN "title" SET NOT NULL;

-- DropEnum
DROP TYPE "Reason";
