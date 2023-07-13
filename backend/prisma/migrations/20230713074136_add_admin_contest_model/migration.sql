/*
  Warnings:

  - You are about to drop the `Contest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contest" DROP CONSTRAINT "Contest_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Contest" DROP CONSTRAINT "Contest_userId_fkey";

-- DropForeignKey
ALTER TABLE "contest_problem" DROP CONSTRAINT "contest_problem_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_record" DROP CONSTRAINT "contest_record_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "submission" DROP CONSTRAINT "submission_contest_id_fkey";

-- AlterTable
ALTER TABLE "contest_problem" ADD COLUMN     "adminContestId" INTEGER;

-- AlterTable
ALTER TABLE "contest_record" ADD COLUMN     "adminContestId" INTEGER;

-- AlterTable
ALTER TABLE "submission" ADD COLUMN     "adminContestId" INTEGER;

-- DropTable
DROP TABLE "Contest";

-- CreateTable
CREATE TABLE "contest" (
    "id" SERIAL NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "config" JSONB NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminContest" (
    "id" SERIAL NOT NULL,
    "groupName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "visible" BOOLEAN NOT NULL,
    "rankVisible" BOOLEAN NOT NULL,
    "difficultyVisible" BOOLEAN NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "userId" INTEGER,
    "groupId" INTEGER,

    CONSTRAINT "AdminContest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contest" ADD CONSTRAINT "contest_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest" ADD CONSTRAINT "contest_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminContest" ADD CONSTRAINT "AdminContest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminContest" ADD CONSTRAINT "AdminContest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_problem" ADD CONSTRAINT "contest_problem_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_problem" ADD CONSTRAINT "contest_problem_adminContestId_fkey" FOREIGN KEY ("adminContestId") REFERENCES "AdminContest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_record" ADD CONSTRAINT "contest_record_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_record" ADD CONSTRAINT "contest_record_adminContestId_fkey" FOREIGN KEY ("adminContestId") REFERENCES "AdminContest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_adminContestId_fkey" FOREIGN KEY ("adminContestId") REFERENCES "AdminContest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
