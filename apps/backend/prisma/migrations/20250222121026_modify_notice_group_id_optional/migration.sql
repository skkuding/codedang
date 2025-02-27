-- DropForeignKey
ALTER TABLE "notice" DROP CONSTRAINT "notice_group_id_fkey";

-- AlterTable
ALTER TABLE "notice" ALTER COLUMN "group_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notice" ADD CONSTRAINT "notice_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
