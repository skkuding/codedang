/*
  Warnings:

  - Added the required column `invitation_code` to the `contest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contest" ADD COLUMN     "invitation_code" TEXT NOT NULL;
