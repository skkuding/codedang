-- 20250713120000_add_testcase_submission_count/migration.sql

-- 필드 추가
ALTER TABLE "problem_testcase"
ADD COLUMN "accepted_count" INT DEFAULT 0,
ADD COLUMN "submission_count" INT DEFAULT 0;

-- 기존 레코드에 대한 필드 값 초기화
UPDATE "problem_testcase"
SET "accepted_count" = 0, "submission_count" = 0;