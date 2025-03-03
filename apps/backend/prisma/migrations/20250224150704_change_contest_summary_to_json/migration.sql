/*
  Warnings:

  - You are about to drop the column `benefits` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `competitionMethod` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `participationTarget` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `problemFormat` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `rankingMethod` on the `contest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contest" DROP COLUMN "benefits",
DROP COLUMN "competitionMethod",
DROP COLUMN "participationTarget",
DROP COLUMN "problemFormat",
DROP COLUMN "rankingMethod",
ADD COLUMN     "contest_summary" JSONB;
