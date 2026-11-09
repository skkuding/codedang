BEGIN;

-- A request spanning several groups must not become readable by the remaining
-- groups once one of its assignments is deleted, so delete the whole request.
CREATE OR REPLACE FUNCTION "public"."remove_deleted_assignment_from_check_request"()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "public"."check_request" AS request
  WHERE request."assignment_ids" @> ARRAY[OLD."id"]
    AND (
      request."assignment_ids" = ARRAY[OLD."id"]
      OR EXISTS (
        SELECT 1
        FROM "public"."assignment" AS assignment
        WHERE assignment."id" = ANY(request."assignment_ids")
          AND assignment."group_id" <> OLD."group_id"
      )
    );

  UPDATE "public"."check_request"
  SET "assignment_ids" = array_remove("assignment_ids", OLD."id")
  WHERE "assignment_ids" @> ARRAY[OLD."id"];

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

COMMIT;
