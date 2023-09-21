/*
  Warnings:

  - The primary key for the `contest_record` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `contest_record` table. All the data in the column will be lost.
  - Made the column `result` on table `submission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "contest_record" DROP CONSTRAINT "contest_record_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "contest_record_pkey" PRIMARY KEY ("contest_id", "user_id");

-- AlterTable
ALTER TABLE "submission" ALTER COLUMN "result" SET NOT NULL;
