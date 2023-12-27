/*
  Warnings:

  - You are about to drop the `contest_notice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "contest_notice" DROP CONSTRAINT "contest_notice_contest_id_problem_id_fkey";

-- DropTable
DROP TABLE "contest_notice";

-- CreateTable
CREATE TABLE "announcement" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_announcement" (
    "id" INTEGER NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "announcement_id" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_announcement_pkey" PRIMARY KEY ("contest_id","announcement_id")
);

-- CreateTable
CREATE TABLE "problem_announcement" (
    "id" INTEGER NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "announcement_id" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_announcement_pkey" PRIMARY KEY ("contest_id","announcement_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contest_announcement_contest_id_id_key" ON "contest_announcement"("contest_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_announcement_contest_id_id_key" ON "problem_announcement"("contest_id", "id");

-- AddForeignKey
ALTER TABLE "contest_announcement" ADD CONSTRAINT "contest_announcement_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_announcement" ADD CONSTRAINT "contest_announcement_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_announcement" ADD CONSTRAINT "problem_announcement_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_announcement" ADD CONSTRAINT "problem_announcement_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
