/*
  Warnings:

  - Added the required column `due_time` to the `assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignment" ADD COLUMN     "due_time" TIMESTAMP(3) NOT NULL;
