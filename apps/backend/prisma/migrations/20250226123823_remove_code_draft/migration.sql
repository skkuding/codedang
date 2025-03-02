/*
  Warnings:

  - You are about to drop the `code_draft` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "code_draft" DROP CONSTRAINT "code_draft_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "code_draft" DROP CONSTRAINT "code_draft_user_id_fkey";

-- DropTable
DROP TABLE "code_draft";
