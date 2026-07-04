/*
  Warnings:

  - Made the column `content` on table `restaurants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "restaurants" ALTER COLUMN "content" SET NOT NULL;
