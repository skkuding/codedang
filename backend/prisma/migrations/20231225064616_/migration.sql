/*
  Warnings:

  - You are about to drop the `user_code_save` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_code_save" DROP CONSTRAINT "user_code_save_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "user_code_save" DROP CONSTRAINT "user_code_save_user_id_fkey";

-- DropTable
DROP TABLE "user_code_save";

-- CreateTable
CREATE TABLE "user_problem" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "template" JSONB[],
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_problem_pkey" PRIMARY KEY ("user_id","problem_id")
);

-- AddForeignKey
ALTER TABLE "user_problem" ADD CONSTRAINT "user_problem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_problem" ADD CONSTRAINT "user_problem_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
