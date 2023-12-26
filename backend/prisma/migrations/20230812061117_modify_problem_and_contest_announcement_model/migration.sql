-- AlterTable
CREATE SEQUENCE contest_announcement_id_seq;
ALTER TABLE "contest_announcement" ALTER COLUMN "id" SET DEFAULT nextval('contest_announcement_id_seq');
ALTER SEQUENCE contest_announcement_id_seq OWNED BY "contest_announcement"."id";

-- AlterTable
CREATE SEQUENCE problem_announcement_id_seq;
ALTER TABLE "problem_announcement" ALTER COLUMN "id" SET DEFAULT nextval('problem_announcement_id_seq');
ALTER SEQUENCE problem_announcement_id_seq OWNED BY "problem_announcement"."id";
