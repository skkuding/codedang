/*
  Warnings:

  - You are about to drop the column `is_read` on the `course_notice_record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."course_notice_record" DROP COLUMN "is_read";
