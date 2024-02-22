/*
  Warnings:

  - You are about to drop the column `input_examples` on the `problem` table. All the data in the column will be lost.
  - You are about to drop the column `output_examples` on the `problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "problem" DROP COLUMN "input_examples",
DROP COLUMN "output_examples";

-- CreateTable
CREATE TABLE "example_io" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "example_io_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "example_io" ADD CONSTRAINT "example_io_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
