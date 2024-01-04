-- DropForeignKey
ALTER TABLE "submssion_result" DROP CONSTRAINT "submssion_result_submission_id_fkey";

-- AlterTable
ALTER TABLE "submission"
ALTER COLUMN "id" SET DATA TYPE INTEGER USING id::INTEGER,
ALTER COLUMN "id" SET NOT NULL;

-- CreateSequence
CREATE SEQUENCE submission_id_seq;

-- AlterTable
ALTER TABLE "submission"
ALTER COLUMN "id" SET DEFAULT nextval('submission_id_seq');

-- AlterTable
ALTER TABLE "submssion_result"
ALTER COLUMN "submission_id" SET DATA TYPE INTEGER USING submission_id::INTEGER;

-- AddForeignKey
ALTER TABLE "submssion_result" ADD CONSTRAINT "submssion_result_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
