/*
  Warnings:

  - You are about to drop the column `tripUrl` on the `Trip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "tripUrl",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "image2" TEXT,
ADD COLUMN     "image3" TEXT,
ADD COLUMN     "image4" TEXT;
