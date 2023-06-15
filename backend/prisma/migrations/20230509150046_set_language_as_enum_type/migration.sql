/*
  Warnings:

  - The primary key for the `submission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hash` on the `submission` table. All the data in the column will be lost.
  - Changed the type of `language` on the `submission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "submssion_result" DROP CONSTRAINT "submssion_result_submission_id_fkey";

-- DropIndex
DROP INDEX "submission_hash_key";

-- AlterTable
ALTER TABLE "submission" DROP CONSTRAINT "submission_pkey",
DROP COLUMN "hash",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL,
ADD CONSTRAINT "submission_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "submission_id_seq";

-- AlterTable
ALTER TABLE "submssion_result" ALTER COLUMN "submission_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "submssion_result" ADD CONSTRAINT "submssion_result_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
