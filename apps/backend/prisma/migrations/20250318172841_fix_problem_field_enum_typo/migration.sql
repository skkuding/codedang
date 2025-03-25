/*
  Warnings:

  - The values [language] on the enum `ProblemField` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProblemField_new" AS ENUM ('title', 'languages', 'description', 'testcase', 'memoryLimit', 'timeLimit', 'hint');
ALTER TABLE "updateHistory" ALTER COLUMN "updatedFields" TYPE "ProblemField_new"[] USING ("updatedFields"::text::"ProblemField_new"[]);
ALTER TYPE "ProblemField" RENAME TO "ProblemField_old";
ALTER TYPE "ProblemField_new" RENAME TO "ProblemField";
DROP TYPE "ProblemField_old";
COMMIT;
