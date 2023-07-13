/*
  Warnings:

  - The `code` column on the `submission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "problem" ADD COLUMN     "template" JSONB[];

-- AlterTable
ALTER TABLE "submission" DROP COLUMN "code",
ADD COLUMN     "code" JSONB[];
