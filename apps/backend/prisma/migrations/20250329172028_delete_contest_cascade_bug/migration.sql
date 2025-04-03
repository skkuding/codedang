/*
  Warnings:

  - The primary key for the `user_contest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contestId` on the `user_contest` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_contest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,contest_id]` on the table `user_contest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contest_id` to the `user_contest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_contest" DROP CONSTRAINT "user_contest_contestId_fkey";

-- DropForeignKey
ALTER TABLE "user_contest" DROP CONSTRAINT "user_contest_userId_fkey";

-- AlterTable
ALTER TABLE "user_contest" DROP CONSTRAINT "user_contest_pkey",
DROP COLUMN "contestId",
DROP COLUMN "userId",
ADD COLUMN     "contest_id" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "user_id" INTEGER,
ADD CONSTRAINT "user_contest_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_contest_user_id_contest_id_key" ON "user_contest"("user_id", "contest_id");

-- AddForeignKey
ALTER TABLE "user_contest" ADD CONSTRAINT "user_contest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_contest" ADD CONSTRAINT "user_contest_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
