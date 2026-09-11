-- Persist the assignment selected when a course Q&A is created.
-- The column is nullable so existing Q&As retain their legacy lookup behavior.
ALTER TABLE "public"."course_qna"
ADD COLUMN "assignment_id" INTEGER;

-- Keep Q&As when an assignment is removed; only clear the stored mapping.
ALTER TABLE "public"."course_qna"
ADD CONSTRAINT "course_qna_assignment_id_fkey"
FOREIGN KEY ("assignment_id") REFERENCES "public"."assignment"("id")
ON DELETE SET NULL ON UPDATE CASCADE NOT VALID;

ALTER TABLE "public"."course_qna"
VALIDATE CONSTRAINT "course_qna_assignment_id_fkey";
