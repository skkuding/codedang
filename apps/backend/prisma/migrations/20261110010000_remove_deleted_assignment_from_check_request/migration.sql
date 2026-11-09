BEGIN;

-- check_request.assignment_ids cannot have a foreign key. Keep the cascade that
-- the old assignment_id foreign key provided, including deletes cascaded from group.
CREATE FUNCTION "public"."remove_deleted_assignment_from_check_request"()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "public"."check_request"
  WHERE "assignment_ids" = ARRAY[OLD."id"];

  UPDATE "public"."check_request"
  SET "assignment_ids" = array_remove("assignment_ids", OLD."id")
  WHERE "assignment_ids" @> ARRAY[OLD."id"];

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "assignment_remove_from_check_request"
AFTER DELETE ON "public"."assignment"
FOR EACH ROW
EXECUTE FUNCTION "public"."remove_deleted_assignment_from_check_request"();

COMMIT;
