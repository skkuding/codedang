/*
  Warnings:

  - The primary key for the `user_contest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,contestId]` on the table `user_contest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "user_contest" DROP CONSTRAINT "user_contest_contestId_fkey";

-- DropForeignKey
ALTER TABLE "user_contest" DROP CONSTRAINT "user_contest_userId_fkey";

-- AlterTable
ALTER TABLE "user_contest" DROP CONSTRAINT "user_contest_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ADD CONSTRAINT "user_contest_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_contest_userId_contestId_key" ON "user_contest"("userId", "contestId");

-- AddForeignKey
ALTER TABLE "user_contest" ADD CONSTRAINT "user_contest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_contest" ADD CONSTRAINT "user_contest_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
