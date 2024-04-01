/*
  Warnings:

  - You are about to drop the column `end_time` on the `workbook` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `workbook` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "workbook" DROP COLUMN "end_time",
DROP COLUMN "start_time";
