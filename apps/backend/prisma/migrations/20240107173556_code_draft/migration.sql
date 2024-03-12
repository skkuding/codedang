-- CreateTable
CREATE TABLE "code_draft" (
    "user_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "template" JSONB[],
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_draft_pkey" PRIMARY KEY ("user_id","problem_id")
);

-- AddForeignKey
ALTER TABLE "code_draft" ADD CONSTRAINT "code_draft_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_draft" ADD CONSTRAINT "code_draft_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
