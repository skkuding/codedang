/*
  Warnings:

  - The primary key for the `contest_problem_record` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `contest_problem_record` table. All the data in the column will be lost.
  - Added the required column `contest_record_id` to the `contest_problem_record` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "contest_problem_record" DROP CONSTRAINT "contest_problem_record_user_id_fkey";

-- AlterTable
ALTER TABLE "contest_problem_record" DROP CONSTRAINT "contest_problem_record_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "contest_record_id" INTEGER NOT NULL,
ADD CONSTRAINT "contest_problem_record_pkey" PRIMARY KEY ("contest_problem_id", "contest_record_id");

-- AddForeignKey
ALTER TABLE "contest_problem_record" ADD CONSTRAINT "contest_problem_record_contest_record_id_fkey" FOREIGN KEY ("contest_record_id") REFERENCES "contest_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
