/*
  Warnings:

  - You are about to drop the column `group_id` on the `contest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "contest" DROP CONSTRAINT "contest_group_id_fkey";

-- AlterTable
ALTER TABLE "contest" DROP COLUMN "group_id";
