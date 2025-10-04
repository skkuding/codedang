-- AlterTable
ALTER TABLE "public"."course_notice_comment" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_secret" BOOLEAN NOT NULL DEFAULT false;
