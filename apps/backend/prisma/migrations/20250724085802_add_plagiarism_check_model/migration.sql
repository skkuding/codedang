-- CreateEnum
CREATE TYPE "CheckResultStatus" AS ENUM ('Pending', 'Completed', 'Failed');

-- CreateTable
CREATE TABLE "plagiarism_check" (
    "id" SERIAL NOT NULL,
    "check_id" TEXT NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "CheckResultStatus" NOT NULL,

    CONSTRAINT "plagiarism_check_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plagiarism_check_check_id_key" ON "plagiarism_check"("check_id");

-- AddForeignKey
ALTER TABLE "plagiarism_check" ADD CONSTRAINT "plagiarism_check_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
