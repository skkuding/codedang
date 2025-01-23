/*
  Warnings:

  - The primary key for the `contest_problem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[contest_id,problem_id]` on the table `contest_problem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "contest" ADD COLUMN     "last_penalty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "penalty" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "contest_problem" DROP CONSTRAINT "contest_problem_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "contest_problem_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "contest_problem_record" (
    "contest_problem_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "finish_time" TIMESTAMP(3),
    "submitCountPenalty" INTEGER NOT NULL DEFAULT 0,
    "timePenalty" INTEGER NOT NULL DEFAULT 0,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_problem_record_pkey" PRIMARY KEY ("contest_problem_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contest_problem_contest_id_problem_id_key" ON "contest_problem"("contest_id", "problem_id");

-- AddForeignKey
ALTER TABLE "contest_problem_record" ADD CONSTRAINT "contest_problem_record_contest_problem_id_fkey" FOREIGN KEY ("contest_problem_id") REFERENCES "contest_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_problem_record" ADD CONSTRAINT "contest_problem_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
