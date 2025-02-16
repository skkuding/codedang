-- AlterTable
ALTER TABLE "contest" ADD COLUMN     "groupId" INTEGER;

-- CreateTable
CREATE TABLE "group_whitelist" (
    "group_id" INTEGER NOT NULL,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "group_whitelist_pkey" PRIMARY KEY ("group_id","student_id")
);

-- AddForeignKey
ALTER TABLE "group_whitelist" ADD CONSTRAINT "group_whitelist_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest" ADD CONSTRAINT "contest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
