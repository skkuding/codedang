-- CreateEnum
CREATE TYPE "public"."TimerType" AS ENUM ('ALL', 'PERSONAL');

-- CreateEnum
CREATE TYPE "public"."TimerStatus" AS ENUM ('RUNNING', 'PAUSED', 'STOPPED');

-- AlterTable
ALTER TABLE "public"."course_info" ADD COLUMN     "invitation_code" TEXT;

-- AlterTable
ALTER TABLE "public"."submission" ADD COLUMN     "group_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."group_tag" (
    "group_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "group_tag_pkey" PRIMARY KEY ("group_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."group_comment" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "is_secret" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "parent_comment_id" INTEGER,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problem_draft" (
    "user_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "code" JSONB NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_draft_pkey" PRIMARY KEY ("user_id","problem_id")
);

-- CreateTable
CREATE TABLE "public"."group_join_request" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "is_accepted" BOOLEAN,
    "request_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "process_time" TIMESTAMP(3),

    CONSTRAINT "group_join_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_timer" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "type" "public"."TimerType" NOT NULL,
    "status" "public"."TimerStatus" NOT NULL DEFAULT 'STOPPED',
    "duration" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3),
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_timer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_join_request_user_id_group_id_key" ON "public"."group_join_request"("user_id", "group_id");

-- CreateIndex
CREATE INDEX "submission_group_id_idx" ON "public"."submission"("group_id");

-- AddForeignKey
ALTER TABLE "public"."group_tag" ADD CONSTRAINT "group_tag_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_tag" ADD CONSTRAINT "group_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_comment" ADD CONSTRAINT "group_comment_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_comment" ADD CONSTRAINT "group_comment_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_comment" ADD CONSTRAINT "group_comment_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."group_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_draft" ADD CONSTRAINT "problem_draft_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_draft" ADD CONSTRAINT "problem_draft_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_join_request" ADD CONSTRAINT "group_join_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_join_request" ADD CONSTRAINT "group_join_request_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_timer" ADD CONSTRAINT "group_timer_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_timer" ADD CONSTRAINT "group_timer_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
