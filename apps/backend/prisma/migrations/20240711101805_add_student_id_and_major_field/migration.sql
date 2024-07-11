/*
  Warnings:

  - A unique constraint covering the columns `[student_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `major` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "major" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_student_id_key" ON "user"("student_id");
