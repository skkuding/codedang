/*
  Warnings:

  - Added the required column `description_summary` to the `contest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contest" ADD COLUMN     "description_summary" VARCHAR(1200) NOT NULL;
