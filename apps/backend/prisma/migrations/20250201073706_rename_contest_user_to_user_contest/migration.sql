/*
  Warnings:

  - You are about to drop the `ContestUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContestUser" DROP CONSTRAINT "ContestUser_contestId_fkey";

-- DropForeignKey
ALTER TABLE "ContestUser" DROP CONSTRAINT "ContestUser_userId_fkey";

-- DropTable
DROP TABLE "ContestUser";

-- CreateTable
CREATE TABLE "user_contest" (
    "userId" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,
    "role" "ContestRole" NOT NULL,

    CONSTRAINT "user_contest_pkey" PRIMARY KEY ("userId","contestId")
);

-- AddForeignKey
ALTER TABLE "user_contest" ADD CONSTRAINT "user_contest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_contest" ADD CONSTRAINT "user_contest_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
