-- DropForeignKey
ALTER TABLE "submssion_result" DROP CONSTRAINT "submssion_result_submission_id_fkey";
ALTER TABLE "submssion_result" RENAME COLUMN "submission_id" TO "hex_code_id";
ALTER TABLE "submssion_result" ADD COLUMN "submission_id" INTEGER;

-- AlterTable
ALTER TABLE "submission" RENAME COLUMN "id" TO "hex_code";
ALTER TABLE "submission" DROP CONSTRAINT "submission_pkey";
ALTER TABLE "submission" ADD COLUMN "id" SERIAL PRIMARY KEY;

UPDATE submssion_result T SET submission_id = (SELECT id FROM submission WHERE hex_code = T.hex_code_id);

-- AlterTable
ALTER TABLE "submission" DROP COLUMN "hex_code";
ALTER TABLE "submssion_result" DROP COLUMN "hex_code_id";
ALTER TABLE "submission_result" ALTER COLUMN "submission_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "submssion_result" ADD CONSTRAINT "submssion_result_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
