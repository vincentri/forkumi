/*
  Warnings:

  - Added the required column `time` to the `events` table without a default value. This is not possible if the table is not empty.
  - Made the column `organized_by` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "time" TEXT NOT NULL,
ALTER COLUMN "organized_by" SET NOT NULL;
