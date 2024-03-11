-- DropForeignKey
ALTER TABLE "contest" DROP CONSTRAINT "contest_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "group" DROP CONSTRAINT "group_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "notice" DROP CONSTRAINT "notice_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "problem" DROP CONSTRAINT "problem_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "workbook" DROP CONSTRAINT "workbook_created_by_id_fkey";

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notice" ADD CONSTRAINT "notice_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem" ADD CONSTRAINT "problem_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest" ADD CONSTRAINT "contest_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workbook" ADD CONSTRAINT "workbook_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
