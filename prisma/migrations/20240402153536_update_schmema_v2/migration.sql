/*
  Warnings:

  - You are about to drop the column `countryCode` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `flagUrl` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "countryCode",
ADD COLUMN     "flagUrl" TEXT NOT NULL,
ADD COLUMN     "saved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tripUrl" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "mustHave" DROP NOT NULL,
ALTER COLUMN "mustHave" SET DATA TYPE TEXT,
ALTER COLUMN "objectsList" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "tours" DROP NOT NULL;
