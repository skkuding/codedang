/*
  Warnings:

  - The `category` column on the `course_qna` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."course_qna" DROP COLUMN "category",
ADD COLUMN     "category" "public"."QnACategory" NOT NULL DEFAULT 'General';

-- DropEnum
DROP TYPE "public"."CourseQnACategory";
