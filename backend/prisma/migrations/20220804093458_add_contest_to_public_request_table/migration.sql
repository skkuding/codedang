-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('Pending', 'Accept', 'Reject');

-- CreateTable
CREATE TABLE "contest_to_public_request" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "request_status" "RequestStatus" NOT NULL DEFAULT E'Pending',
    "created_by_id" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_to_public_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contest_to_public_request_contest_id_key" ON "contest_to_public_request"("contest_id");

-- AddForeignKey
ALTER TABLE "contest_to_public_request" ADD CONSTRAINT "contest_to_public_request_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_to_public_request" ADD CONSTRAINT "contest_to_public_request_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
