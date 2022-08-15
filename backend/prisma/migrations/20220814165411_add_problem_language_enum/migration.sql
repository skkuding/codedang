/*
  Warnings:

  - The `languages` column on the `problem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `language` on the `submission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('C', 'Cpp', 'Python2', 'Python3', 'Golang', 'Java');

-- AlterTable
ALTER TABLE "problem" DROP COLUMN "languages",
ADD COLUMN     "languages" "Language"[];

-- AlterTable
ALTER TABLE "submission" DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL;
