/*
  Warnings:

  - You are about to drop the `contest` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPT', 'REJECT', 'NONE');

-- DropForeignKey
ALTER TABLE "contest" DROP CONSTRAINT "contest_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "contest" DROP CONSTRAINT "contest_group_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_problem" DROP CONSTRAINT "contest_problem_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_record" DROP CONSTRAINT "contest_record_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "submission" DROP CONSTRAINT "submission_contest_id_fkey";

-- DropTable
DROP TABLE "contest";

-- CreateTable
CREATE TABLE "Contest" (
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

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_problem" ADD CONSTRAINT "contest_problem_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_record" ADD CONSTRAINT "contest_record_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
