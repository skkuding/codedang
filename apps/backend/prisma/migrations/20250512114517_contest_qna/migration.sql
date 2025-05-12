-- CreateTable
CREATE TABLE "contest_qna" (
    "id" SERIAL NOT NULL,
    "created_by_id" INTEGER,
    "answered_by_id" INTEGER,
    "contest_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "answer" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT false,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_qna_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contest_qna" ADD CONSTRAINT "contest_qna_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_qna" ADD CONSTRAINT "contest_qna_answered_by_id_fkey" FOREIGN KEY ("answered_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_qna" ADD CONSTRAINT "contest_qna_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
