/*
  Warnings:

  - You are about to drop the column `lugaggeSize` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `luggageSize` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "lugaggeSize",
ADD COLUMN     "luggageSize" TEXT NOT NULL;
