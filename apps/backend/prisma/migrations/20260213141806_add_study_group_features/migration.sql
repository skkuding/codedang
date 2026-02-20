-- AlterTable
ALTER TABLE "public"."user_group" ADD COLUMN     "total_study_time" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."study_info" (
    "group_id" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "invitation_code" TEXT,

    CONSTRAINT "study_info_pkey" PRIMARY KEY ("group_id")
);

-- AddForeignKey
ALTER TABLE "public"."study_info" ADD CONSTRAINT "study_info_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
