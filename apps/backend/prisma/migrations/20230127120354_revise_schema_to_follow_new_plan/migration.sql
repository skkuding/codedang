/*
  Warnings:

  - You are about to drop the column `description_summary` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `is_rank_visible` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `visible` on the `contest` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `contest_record` table. All the data in the column will be lost.
  - You are about to drop the column `fixed` on the `notice` table. All the data in the column will be lost.
  - You are about to drop the column `visible` on the `notice` table. All the data in the column will be lost.
  - You are about to drop the column `accepted_num` on the `problem` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `problem` table. All the data in the column will be lost.
  - You are about to drop the column `shared` on the `problem` table. All the data in the column will be lost.
  - You are about to drop the column `submission_num` on the `problem` table. All the data in the column will be lost.
  - The `languages` column on the `problem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `score` on the `problem_testcase` table. All the data in the column will be lost.
  - You are about to drop the column `ip_addr` on the `submission` table. All the data in the column will be lost.
  - You are about to drop the column `shared` on the `submission` table. All the data in the column will be lost.
  - You are about to drop the column `accepted_num` on the `submssion_result` table. All the data in the column will be lost.
  - You are about to drop the column `total_score` on the `submssion_result` table. All the data in the column will be lost.
  - You are about to drop the column `visible` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the column `is_registered` on the `user_group` table. All the data in the column will be lost.
  - You are about to drop the column `visible` on the `workbook` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `workbook_problem` table. All the data in the column will be lost.
  - You are about to drop the `contest_publicizing_request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contest_rank_acm` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[hash]` on the table `submission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `config` to the `contest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `difficulty` on the `problem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `hash` to the `submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problem_test_case_id` to the `submssion_result` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `result` on the `submssion_result` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Level" AS ENUM ('Level1', 'Level2', 'Level3');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('C', 'Cpp', 'Java', 'Python3');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('Accepted', 'WrongAnswer', 'CompileError', 'RuntimeError', 'TimeLimitExceeded', 'MemoryLimitExceeded', 'OutputLimitExceeded');

-- DropForeignKey
ALTER TABLE "contest_publicizing_request" DROP CONSTRAINT "contest_publicizing_request_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_publicizing_request" DROP CONSTRAINT "contest_publicizing_request_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_rank_acm" DROP CONSTRAINT "contest_rank_acm_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_rank_acm" DROP CONSTRAINT "contest_rank_acm_user_id_fkey";

-- AlterTable
ALTER TABLE "contest" DROP COLUMN "description_summary",
DROP COLUMN "isPublic",
DROP COLUMN "is_rank_visible",
DROP COLUMN "type",
DROP COLUMN "visible",
ADD COLUMN     "config" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "contest_record" DROP COLUMN "rank",
ADD COLUMN     "accepted_problem_num" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_penalty" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "notice" DROP COLUMN "fixed",
DROP COLUMN "visible",
ADD COLUMN     "is_fixed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_visible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "problem" DROP COLUMN "accepted_num",
DROP COLUMN "score",
DROP COLUMN "shared",
DROP COLUMN "submission_num",
ADD COLUMN     "input_examples" TEXT[],
ADD COLUMN     "output_examples" TEXT[],
DROP COLUMN "languages",
ADD COLUMN     "languages" "Language"[],
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "Level" NOT NULL,
ALTER COLUMN "source" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "problem_testcase" DROP COLUMN "score",
ADD COLUMN     "score_weight" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "submission" DROP COLUMN "ip_addr",
DROP COLUMN "shared",
ADD COLUMN     "hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "submssion_result" DROP COLUMN "accepted_num",
DROP COLUMN "total_score",
ADD COLUMN     "problem_test_case_id" INTEGER NOT NULL,
DROP COLUMN "result",
ADD COLUMN     "result" "ResultStatus" NOT NULL;

-- AlterTable
ALTER TABLE "tag" DROP COLUMN "visible";

-- AlterTable
ALTER TABLE "user_group" DROP COLUMN "is_registered";

-- AlterTable
ALTER TABLE "workbook" DROP COLUMN "visible",
ADD COLUMN     "is_visible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "workbook_problem" DROP COLUMN "score";

-- DropTable
DROP TABLE "contest_publicizing_request";

-- DropTable
DROP TABLE "contest_rank_acm";

-- DropEnum
DROP TYPE "ContestType";

-- DropEnum
DROP TYPE "RequestStatus";

-- CreateIndex
CREATE UNIQUE INDEX "submission_hash_key" ON "submission"("hash");

-- AddForeignKey
ALTER TABLE "submssion_result" ADD CONSTRAINT "submssion_result_problem_test_case_id_fkey" FOREIGN KEY ("problem_test_case_id") REFERENCES "problem_testcase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
