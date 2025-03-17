-- CreateEnum
CREATE TYPE "ProblemField" AS ENUM ('title', 'language', 'description', 'testcase', 'memoryLimit', 'timeLimit', 'hint');

-- CreateTable
CREATE TABLE "updateHistory" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByid" INTEGER NOT NULL,
    "updatedFields" "ProblemField"[],
    "updatedInfo" JSONB[],

    CONSTRAINT "updateHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "updateHistory" ADD CONSTRAINT "updateHistory_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updateHistory" ADD CONSTRAINT "updateHistory_updatedByid_fkey" FOREIGN KEY ("updatedByid") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
