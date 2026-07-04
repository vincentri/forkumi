/*
  Warnings:

  - Added the required column `slug` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "blog_tags" DROP CONSTRAINT "blog_tags_tag_id_fkey";

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "slug" TEXT NOT NULL;
