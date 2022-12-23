/*
  Warnings:

  - You are about to drop the `contest_to_public_request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "contest_to_public_request" DROP CONSTRAINT "contest_to_public_request_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "contest_to_public_request" DROP CONSTRAINT "contest_to_public_request_created_by_id_fkey";

-- DropTable
DROP TABLE "contest_to_public_request";

-- CreateTable
CREATE TABLE "contest_publicizing_request" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "request_status" "RequestStatus" NOT NULL DEFAULT 'Pending',
    "created_by_id" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_publicizing_request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contest_publicizing_request" ADD CONSTRAINT "contest_publicizing_request_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_publicizing_request" ADD CONSTRAINT "contest_publicizing_request_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
