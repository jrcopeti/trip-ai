/*
  Warnings:

  - Added the required column `transport` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "placeholder" TEXT,
ADD COLUMN     "transport" TEXT NOT NULL;
