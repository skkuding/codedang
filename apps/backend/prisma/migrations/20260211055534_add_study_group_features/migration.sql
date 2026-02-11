-- AlterTable
ALTER TABLE "user_group" ADD COLUMN     "total_study_time" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "study_info" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "invitation_code" TEXT,

    CONSTRAINT "study_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_info_group_id_key" ON "study_info"("group_id");

-- AddForeignKey
ALTER TABLE "study_info" ADD CONSTRAINT "study_info_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
