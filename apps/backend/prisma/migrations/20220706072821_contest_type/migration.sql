/*
  Warnings:

  - Changed the type of `type` on the `contest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ContestType" AS ENUM ('ACM', 'TotalScore', 'ProblemBank');

-- AlterTable
ALTER TABLE "contest" DROP COLUMN "type",
ADD COLUMN     "type" "ContestType" NOT NULL;
