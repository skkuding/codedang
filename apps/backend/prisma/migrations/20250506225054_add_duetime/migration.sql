/*
  Warnings:

  - Added the required column `due_time` to the `assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignment" ADD COLUMN       "due_time" TIMESTAMP(3);
UPDATE "assignment" SET    "due_time" = "end_time" WHERE "due_time" IS NULL;
ALTER TABLE "assignment" ALTER COLUMN     "due_time"  SET NOT NULL;
