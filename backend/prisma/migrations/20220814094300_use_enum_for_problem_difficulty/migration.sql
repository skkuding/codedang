/*
  Warnings:

  - Changed the type of `difficulty` on the `problem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProblemDifficulty" AS ENUM ('Level1', 'Level2', 'Level3', 'Level4', 'Level5', 'Level6', 'Level7');

-- AlterTable
ALTER TABLE "problem" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "ProblemDifficulty" NOT NULL;
