/*
  Warnings:

  - Added the required column `is_visible` to the `course_notice_comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."course_notice_comment" DROP CONSTRAINT "course_notice_comment_reply_on_id_fkey";

-- AlterTable
ALTER TABLE "public"."course_notice_comment" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_secret" BOOLEAN NOT NULL DEFAULT false;
