--isOutdated가 false인 TC에 대해서만 인덱싱합니다.
CREATE INDEX IF NOT EXISTS idx_problem_testcase_pid_valid
ON "problem_testcase" ("problem_id")
WHERE "is_outdated" = false;
