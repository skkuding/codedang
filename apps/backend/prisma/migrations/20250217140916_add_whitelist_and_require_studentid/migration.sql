/*
  Warnings:

  - Made the column `student_id` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "student_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "group_whitelist" (
    "group_id" INTEGER NOT NULL,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "group_whitelist_pkey" PRIMARY KEY ("group_id","student_id")
);

-- AddForeignKey
ALTER TABLE "group_whitelist" ADD CONSTRAINT "group_whitelist_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
