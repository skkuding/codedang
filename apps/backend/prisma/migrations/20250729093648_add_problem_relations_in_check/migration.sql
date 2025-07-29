-- AlterTable
ALTER TABLE "plagiarism_check" ADD COLUMN     "assignment_id" INTEGER,
ADD COLUMN     "contest_id" INTEGER,
ADD COLUMN     "workbook_id" INTEGER;

-- AddForeignKey
ALTER TABLE "plagiarism_check" ADD CONSTRAINT "plagiarism_check_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plagiarism_check" ADD CONSTRAINT "plagiarism_check_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plagiarism_check" ADD CONSTRAINT "plagiarism_check_workbook_id_fkey" FOREIGN KEY ("workbook_id") REFERENCES "workbook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
