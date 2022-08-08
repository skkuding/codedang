/*
  Warnings:

  - You are about to drop the column `group_id` on the `problem` table. All the data in the column will be lost.
  - Added the required column `is_public` to the `problem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "problem" DROP CONSTRAINT "problem_group_id_fkey";

-- AlterTable
ALTER TABLE "contest" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "problem" DROP COLUMN "group_id",
ADD COLUMN     "is_public" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "workbook" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "group_problem" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,

    CONSTRAINT "group_problem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_problem" ADD CONSTRAINT "group_problem_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_problem" ADD CONSTRAINT "group_problem_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
