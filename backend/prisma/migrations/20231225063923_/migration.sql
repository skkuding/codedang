/*
  Warnings:

  - You are about to drop the `user_problem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_problem" DROP CONSTRAINT "user_problem_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "user_problem" DROP CONSTRAINT "user_problem_user_id_fkey";

-- DropTable
DROP TABLE "user_problem";

-- CreateTable
CREATE TABLE "user_code_save" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "template" JSONB[],
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_code_save_pkey" PRIMARY KEY ("user_id","problem_id")
);

-- AddForeignKey
ALTER TABLE "user_code_save" ADD CONSTRAINT "user_code_save_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_code_save" ADD CONSTRAINT "user_code_save_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
