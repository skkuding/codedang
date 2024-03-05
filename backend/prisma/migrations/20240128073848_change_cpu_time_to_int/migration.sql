/*
  Warnings:

  - You are about to alter the column `cpu_time` on the `submission_result` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "submission_result" ALTER COLUMN "cpu_time" SET DATA TYPE INTEGER;
