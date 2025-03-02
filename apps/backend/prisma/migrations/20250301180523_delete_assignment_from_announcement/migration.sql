/*
  Warnings:

  - You are about to drop the column `assignment_id` on the `announcement` table. All the data in the column will be lost.
  - Made the column `contest_id` on table `announcement` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "announcement" DROP CONSTRAINT "announcement_assignment_id_fkey";

-- AlterTable
ALTER TABLE "announcement" DROP COLUMN "assignment_id",
ALTER COLUMN "contest_id" SET NOT NULL;
