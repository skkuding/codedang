/*
  Warnings:

  - You are about to drop the column `group_id` on the `problem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "problem" DROP CONSTRAINT "problem_group_id_fkey";

-- AlterTable
ALTER TABLE "problem" DROP COLUMN "group_id";
