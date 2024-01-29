-- AlterTable
ALTER TABLE "contest_record" ADD COLUMN     "latest_accepted_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
