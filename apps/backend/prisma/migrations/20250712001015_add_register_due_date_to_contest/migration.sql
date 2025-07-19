/*
  Warnings:

  - Added the required column `register_due_time` to the `contest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contest" ADD COLUMN     "register_due_time" TIMESTAMP(3) NOT NULL;
