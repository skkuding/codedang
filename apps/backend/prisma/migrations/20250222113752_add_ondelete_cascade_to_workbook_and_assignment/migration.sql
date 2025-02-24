-- DropForeignKey
ALTER TABLE "assignment" DROP CONSTRAINT "assignment_group_id_fkey";

-- DropForeignKey
ALTER TABLE "workbook" DROP CONSTRAINT "workbook_group_id_fkey";

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workbook" ADD CONSTRAINT "workbook_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
