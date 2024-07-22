/*
  Warnings:

  - A unique constraint covering the columns `[student_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "major" TEXT,
ADD COLUMN     "student_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_student_id_key" ON "user"("student_id");
