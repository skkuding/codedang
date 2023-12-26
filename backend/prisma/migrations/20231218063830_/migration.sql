/*
  Warnings:

  - You are about to drop the `contest_announcement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `problem_announcement` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `announcement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `problem_id` to the `announcement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "contest_announcement" DROP CONSTRAINT "contest_announcement_announcement_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_announcement" DROP CONSTRAINT "contest_announcement_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "problem_announcement" DROP CONSTRAINT "problem_announcement_announcement_id_fkey";

-- DropForeignKey
ALTER TABLE "problem_announcement" DROP CONSTRAINT "problem_announcement_contest_id_fkey";

-- AlterTable
ALTER TABLE "announcement" ADD COLUMN     "problem_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "contest_announcement";

-- DropTable
DROP TABLE "problem_announcement";

-- CreateIndex
CREATE UNIQUE INDEX "announcement_id_key" ON "announcement"("id");

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
