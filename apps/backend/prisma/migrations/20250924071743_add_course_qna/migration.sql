-- CreateEnum
CREATE TYPE "public"."QnACategory" AS ENUM ('General', 'Problem');

-- CreateTable
CREATE TABLE "public"."course_qna" (
    "id" SERIAL NOT NULL,
    "order" INTEGER NOT NULL,
    "created_by_id" INTEGER,
    "group_id" INTEGER NOT NULL,
    "problem_id" INTEGER,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "public"."QnACategory" NOT NULL DEFAULT 'General',
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_by" INTEGER[],

    CONSTRAINT "course_qna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_qna_comment" (
    "id" SERIAL NOT NULL,
    "order" INTEGER NOT NULL,
    "created_by_id" INTEGER,
    "is_course_staff" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "course_qna_id" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_qna_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_qna_group_id_order_key" ON "public"."course_qna"("group_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "course_qna_comment_course_qna_id_order_key" ON "public"."course_qna_comment"("course_qna_id", "order");

-- AddForeignKey
ALTER TABLE "public"."course_qna" ADD CONSTRAINT "course_qna_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_qna" ADD CONSTRAINT "course_qna_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_qna" ADD CONSTRAINT "course_qna_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_qna_comment" ADD CONSTRAINT "course_qna_comment_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_qna_comment" ADD CONSTRAINT "course_qna_comment_course_qna_id_fkey" FOREIGN KEY ("course_qna_id") REFERENCES "public"."course_qna"("id") ON DELETE CASCADE ON UPDATE CASCADE;
