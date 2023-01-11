/*
  Warnings:

  - You are about to drop the column `isPublic` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the `group_problem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "group_problem" DROP CONSTRAINT "group_problem_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_problem" DROP CONSTRAINT "group_problem_problem_id_fkey";

-- AlterTable
ALTER TABLE "contest" DROP COLUMN "isPublic";

-- AlterTable
ALTER TABLE "problem" ADD COLUMN     "groupId" INTEGER;

-- DropTable
DROP TABLE "group_problem";

-- AddForeignKey
ALTER TABLE "problem" ADD CONSTRAINT "problem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
