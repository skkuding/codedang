/*
  Warnings:

  - Added the required column `check_previous_submission` to the `plagiarism_check` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enable_merging` to the `plagiarism_check` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `plagiarism_check` table without a default value. This is not possible if the table is not empty.
  - Added the required column `use_jplag_clustering` to the `plagiarism_check` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plagiarism_check" ADD COLUMN     "check_previous_submission" BOOLEAN NOT NULL,
ADD COLUMN     "enable_merging" BOOLEAN NOT NULL,
ADD COLUMN     "language" "Language" NOT NULL,
ADD COLUMN     "use_jplag_clustering" BOOLEAN NOT NULL,
ADD COLUMN     "user_id" INTEGER,
ADD COLUMN     "user_ip" TEXT;

-- AddForeignKey
ALTER TABLE "plagiarism_check" ADD CONSTRAINT "plagiarism_check_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
