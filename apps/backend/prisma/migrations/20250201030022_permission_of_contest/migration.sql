-- CreateEnum
CREATE TYPE "ContestRole" AS ENUM ('Participant', 'Reviewer', 'Manager', 'Admin');

-- CreateTable
CREATE TABLE "ContestUser" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,
    "role" "ContestRole" NOT NULL,

    CONSTRAINT "ContestUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContestUser" ADD CONSTRAINT "ContestUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestUser" ADD CONSTRAINT "ContestUser_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
