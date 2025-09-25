/*
  Warnings:

  - You are about to drop the column `problem_id` on the `course_notice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."course_notice" DROP CONSTRAINT "course_notice_problem_id_fkey";

-- AlterTable
ALTER TABLE "public"."course_notice" DROP COLUMN "problem_id";
