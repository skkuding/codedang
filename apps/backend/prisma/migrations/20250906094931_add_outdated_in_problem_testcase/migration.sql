-- AlterTable
ALTER TABLE "public"."problem_testcase" ADD COLUMN     "is_outdated" BOOLEAN NOT NULL DEFAULT false;
-- AlterTable
ALTER TABLE "public"."problem_testcase" ADD COLUMN     "outdate_time" TIMESTAMP(3);
