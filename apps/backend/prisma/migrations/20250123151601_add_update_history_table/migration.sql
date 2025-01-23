-- CreateTable
CREATE TABLE "updateHistory" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_fields" JSONB NOT NULL,

    CONSTRAINT "updateHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "updateHistory" ADD CONSTRAINT "updateHistory_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
