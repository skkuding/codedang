/*
  Warnings:

  - You are about to drop the `example_io` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "example_io" DROP CONSTRAINT "example_io_problem_id_fkey";

-- AlterTable
ALTER TABLE "problem_testcase" ADD COLUMN     "is_hidden_testcase" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "example_io";
