BEGIN;

-- DropForeignKey
ALTER TABLE "public"."check_request" DROP CONSTRAINT "check_request_assignment_id_fkey";

-- AlterTable
ALTER TABLE "public"."check_request" ADD COLUMN     "assignment_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- Preserve existing single-assignment requests before dropping the old column.
UPDATE "public"."check_request"
SET "assignment_ids" = ARRAY["assignment_id"]
WHERE "assignment_id" IS NOT NULL;

ALTER TABLE "public"."check_request" DROP COLUMN "assignment_id";

COMMIT;
