/*
  Warnings:

  - You are about to drop the column `image` on the `section_cards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "section_cards" DROP COLUMN "image",
ADD COLUMN     "icon" TEXT;
