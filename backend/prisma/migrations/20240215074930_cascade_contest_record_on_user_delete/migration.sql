/*
  Warnings:

  - Made the column `user_id` on table `contest_record` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "contest_record" DROP CONSTRAINT "contest_record_user_id_fkey";

-- AlterTable
ALTER TABLE "contest_record" ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "contest_record" ADD CONSTRAINT "contest_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
