/*
  Warnings:

  - You are about to drop the column `countryCode` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `mustHave` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `objectsList` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `tours` on the `Trip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "countryCode",
DROP COLUMN "description",
DROP COLUMN "mustHave",
DROP COLUMN "objectsList",
DROP COLUMN "title",
DROP COLUMN "tours";
