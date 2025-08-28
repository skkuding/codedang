-- CreateTable
CREATE TABLE "public"."course_notice" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "problem_id" INTEGER,
    "created_by_id" INTEGER,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_fixed" BOOLEAN NOT NULL DEFAULT false,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_notice_record" (
    "id" SERIAL NOT NULL,
    "course_notice_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_notice_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_notice_comment" (
    "id" SERIAL NOT NULL,
    "order" INTEGER,
    "nested_order" INTEGER,
    "created_by_id" INTEGER,
    "reply_on_id" INTEGER,
    "content" TEXT NOT NULL,
    "course_notice_id" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_notice_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_notice_record_user_id_create_time_id_idx" ON "public"."course_notice_record"("user_id", "create_time", "id");

-- CreateIndex
CREATE UNIQUE INDEX "course_notice_comment_course_notice_id_order_key" ON "public"."course_notice_comment"("course_notice_id", "order");

-- AddForeignKey
ALTER TABLE "public"."course_notice" ADD CONSTRAINT "course_notice_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_notice" ADD CONSTRAINT "course_notice_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_notice" ADD CONSTRAINT "course_notice_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_notice_record" ADD CONSTRAINT "course_notice_record_course_notice_id_fkey" FOREIGN KEY ("course_notice_id") REFERENCES "public"."course_notice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_notice_record" ADD CONSTRAINT "course_notice_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_notice_comment" ADD CONSTRAINT "course_notice_comment_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_notice_comment" ADD CONSTRAINT "course_notice_comment_reply_on_id_fkey" FOREIGN KEY ("reply_on_id") REFERENCES "public"."course_notice_comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_notice_comment" ADD CONSTRAINT "course_notice_comment_course_notice_id_fkey" FOREIGN KEY ("course_notice_id") REFERENCES "public"."course_notice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
