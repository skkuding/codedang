BEGIN;

-- CreateTable
CREATE TABLE "public"."check_request_assignment" (
    "check_request_id" INTEGER NOT NULL,
    "assignment_id" INTEGER NOT NULL,

    CONSTRAINT "check_request_assignment_pkey" PRIMARY KEY ("check_request_id","assignment_id")
);

-- CreateIndex
CREATE INDEX "check_request_assignment_assignment_id_idx" ON "public"."check_request_assignment"("assignment_id");

-- AddForeignKey
ALTER TABLE "public"."check_request_assignment" ADD CONSTRAINT "check_request_assignment_check_request_id_fkey" FOREIGN KEY ("check_request_id") REFERENCES "public"."check_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."check_request_assignment" ADD CONSTRAINT "check_request_assignment_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve existing single-assignment requests before dropping the old column.
INSERT INTO "public"."check_request_assignment" ("check_request_id", "assignment_id")
SELECT "id", "assignment_id"
FROM "public"."check_request"
WHERE "assignment_id" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "public"."check_request" DROP CONSTRAINT "check_request_assignment_id_fkey";

-- AlterTable
ALTER TABLE "public"."check_request" DROP COLUMN "assignment_id";

-- The foreign key cascade alone would only drop the deleted assignment's row and
-- shrink the request. Its results were computed over every listed assignment, and
-- a request spanning several groups must not become readable by the remaining
-- groups, so the whole request goes. BEFORE runs ahead of the cascade, while the
-- join rows still exist, and also fires for deletes cascaded from group.
CREATE FUNCTION "public"."delete_check_request_on_assignment_delete"()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "public"."check_request"
  WHERE "id" IN (
    SELECT "check_request_id"
    FROM "public"."check_request_assignment"
    WHERE "assignment_id" = OLD."id"
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "assignment_delete_check_request"
BEFORE DELETE ON "public"."assignment"
FOR EACH ROW
EXECUTE FUNCTION "public"."delete_check_request_on_assignment_delete"();

COMMIT;
