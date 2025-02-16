/*
  Warnings:

  - Made the column `student_id` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "student_id" SET NOT NULL;
