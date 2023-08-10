/*
  Warnings:

  - Added the required column `cpu_time` to the `submssion_result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memory_usage` to the `submssion_result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "submssion_result" ADD COLUMN     "cpu_time" BIGINT NOT NULL,
ADD COLUMN     "memory_usage" INTEGER NOT NULL;
