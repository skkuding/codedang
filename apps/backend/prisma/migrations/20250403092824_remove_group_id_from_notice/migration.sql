/*
  Warnings:

  - You are about to drop the column `group_id` on the `notice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "notice" DROP CONSTRAINT "notice_group_id_fkey";

-- AlterTable
ALTER TABLE "notice" DROP COLUMN "group_id";
