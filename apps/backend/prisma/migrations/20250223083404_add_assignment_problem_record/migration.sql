/*
  Warnings:

  - You are about to drop the column `invitation_code` on the `assignment` table. All the data in the column will be lost.
  - The primary key for the `assignment_problem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[assignment_id,problem_id]` on the table `assignment_problem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "assignment" DROP COLUMN "invitation_code";

-- AlterTable
ALTER TABLE "assignment_problem" DROP CONSTRAINT "assignment_problem_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "assignment_problem_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "assignment_problem_record" (
    "assignment_problem_id" INTEGER NOT NULL,
    "assignment_record_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "is_submitted" BOOLEAN NOT NULL DEFAULT false,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "assignment_problem_record_pkey" PRIMARY KEY ("assignment_problem_id","assignment_record_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assignment_problem_assignment_id_problem_id_key" ON "assignment_problem"("assignment_id", "problem_id");

-- AddForeignKey
ALTER TABLE "assignment_problem_record" ADD CONSTRAINT "assignment_problem_record_assignment_problem_id_fkey" FOREIGN KEY ("assignment_problem_id") REFERENCES "assignment_problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_problem_record" ADD CONSTRAINT "assignment_problem_record_assignment_record_id_fkey" FOREIGN KEY ("assignment_record_id") REFERENCES "assignment_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
