/*
  Warnings:

  - You are about to drop the `course_notice_record` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."course_notice_record" DROP CONSTRAINT "course_notice_record_course_notice_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."course_notice_record" DROP CONSTRAINT "course_notice_record_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."course_notice" ADD COLUMN     "read_by" INTEGER[];

-- DropTable
DROP TABLE "public"."course_notice_record";
