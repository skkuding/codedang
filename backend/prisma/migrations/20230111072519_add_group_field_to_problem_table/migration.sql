/*
  Warnings:

  - You are about to drop the column `isPublic` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `create_time` on the `group_problem` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `group_problem` table. All the data in the column will be lost.
  - You are about to drop the column `problem_id` on the `group_problem` table. All the data in the column will be lost.
  - You are about to drop the column `update_time` on the `group_problem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupId,problemId]` on the table `group_problem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `group_problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemId` to the `group_problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateTime` to the `group_problem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "group_problem" DROP CONSTRAINT "group_problem_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_problem" DROP CONSTRAINT "group_problem_problem_id_fkey";

-- DropIndex
DROP INDEX "group_problem_group_id_problem_id_key";

-- AlterTable
ALTER TABLE "contest" DROP COLUMN "isPublic";

-- AlterTable
ALTER TABLE "group_problem" DROP COLUMN "create_time",
DROP COLUMN "group_id",
DROP COLUMN "problem_id",
DROP COLUMN "update_time",
ADD COLUMN     "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "groupId" INTEGER NOT NULL,
ADD COLUMN     "problemId" INTEGER NOT NULL,
ADD COLUMN     "updateTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "problem" ADD COLUMN     "groupId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "group_problem_groupId_problemId_key" ON "group_problem"("groupId", "problemId");

-- AddForeignKey
ALTER TABLE "group_problem" ADD CONSTRAINT "group_problem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_problem" ADD CONSTRAINT "group_problem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem" ADD CONSTRAINT "problem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
