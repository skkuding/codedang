/*
  Warnings:

  - You are about to drop the column `answer` on the `contest_qna` table. All the data in the column will be lost.
  - You are about to drop the column `answered_by_id` on the `contest_qna` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "contest_qna" DROP CONSTRAINT "contest_qna_answered_by_id_fkey";

-- AlterTable
ALTER TABLE "contest_qna" DROP COLUMN "answer",
DROP COLUMN "answered_by_id",
ADD COLUMN     "is_resolved" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "contest_qna_comment" (
    "id" SERIAL NOT NULL,
    "order" INTEGER NOT NULL,
    "created_by_id" INTEGER,
    "content" TEXT NOT NULL,
    "contest_qna_id" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_qna_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contest_qna_comment_contest_qna_id_order_key" ON "contest_qna_comment"("contest_qna_id", "order");

-- AddForeignKey
ALTER TABLE "contest_qna_comment" ADD CONSTRAINT "contest_qna_comment_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_qna_comment" ADD CONSTRAINT "contest_qna_comment_contest_qna_id_fkey" FOREIGN KEY ("contest_qna_id") REFERENCES "contest_qna"("id") ON DELETE CASCADE ON UPDATE CASCADE;
