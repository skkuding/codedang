/*
  Warnings:

  - The primary key for the `contest_record` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_by_id` on the `group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contest_id,user_id]` on the table `contest_record` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "contest" DROP CONSTRAINT "contest_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_record" DROP CONSTRAINT "contest_record_user_id_fkey";

-- DropForeignKey
ALTER TABLE "group" DROP CONSTRAINT "group_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "notice" DROP CONSTRAINT "notice_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "problem" DROP CONSTRAINT "problem_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "submission" DROP CONSTRAINT "submission_user_id_fkey";

-- DropForeignKey
ALTER TABLE "workbook" DROP CONSTRAINT "workbook_created_by_id_fkey";

-- AlterTable
ALTER TABLE "contest" ALTER COLUMN "created_by_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "contest_record" DROP CONSTRAINT "contest_record_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL,
ADD CONSTRAINT "contest_record_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "group" DROP COLUMN "created_by_id";

-- AlterTable
ALTER TABLE "notice" ALTER COLUMN "created_by_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "problem" ALTER COLUMN "created_by_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "submission" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "workbook" ALTER COLUMN "created_by_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "contest_record_contest_id_user_id_key" ON "contest_record"("contest_id", "user_id");

-- AddForeignKey
ALTER TABLE "notice" ADD CONSTRAINT "notice_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem" ADD CONSTRAINT "problem_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest" ADD CONSTRAINT "contest_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_record" ADD CONSTRAINT "contest_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workbook" ADD CONSTRAINT "workbook_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
