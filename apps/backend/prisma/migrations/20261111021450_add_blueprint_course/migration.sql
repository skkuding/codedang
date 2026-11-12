-- AlterTable
ALTER TABLE "public"."assignment" ADD COLUMN     "blueprint_assignment_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."course_info" ADD COLUMN     "blueprint_course_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."blueprint_course" (
    "id" SERIAL NOT NULL,
    "course_title" TEXT NOT NULL,
    "course_num" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "week" INTEGER NOT NULL DEFAULT 16,
    "professor" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "office" TEXT,
    "phone_num" TEXT,
    "created_by_id" INTEGER,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blueprint_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blueprint_assignment" (
    "id" SERIAL NOT NULL,
    "blueprint_course_id" INTEGER NOT NULL,
    "created_by_id" INTEGER,
    "week" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_rank_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_judge_result_visible" BOOLEAN NOT NULL DEFAULT true,
    "enable_copy_paste" BOOLEAN NOT NULL DEFAULT true,
    "auto_finalize_score" BOOLEAN NOT NULL DEFAULT false,
    "is_exercise" BOOLEAN NOT NULL DEFAULT false,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blueprint_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blueprint_assignment_problem" (
    "blueprint_assignment_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blueprint_assignment_problem_pkey" PRIMARY KEY ("blueprint_assignment_id","problem_id")
);

-- CreateIndex
CREATE INDEX "blueprint_course_created_by_id_idx" ON "public"."blueprint_course"("created_by_id");

-- CreateIndex
CREATE INDEX "blueprint_assignment_blueprint_course_id_week_idx" ON "public"."blueprint_assignment"("blueprint_course_id", "week");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_blueprint_assignment_id_group_id_key" ON "public"."assignment"("blueprint_assignment_id", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_info_blueprint_course_id_class_num_key" ON "public"."course_info"("blueprint_course_id", "class_num");

-- AddForeignKey
ALTER TABLE "public"."course_info" ADD CONSTRAINT "course_info_blueprint_course_id_fkey" FOREIGN KEY ("blueprint_course_id") REFERENCES "public"."blueprint_course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blueprint_course" ADD CONSTRAINT "blueprint_course_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment" ADD CONSTRAINT "assignment_blueprint_assignment_id_fkey" FOREIGN KEY ("blueprint_assignment_id") REFERENCES "public"."blueprint_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blueprint_assignment" ADD CONSTRAINT "blueprint_assignment_blueprint_course_id_fkey" FOREIGN KEY ("blueprint_course_id") REFERENCES "public"."blueprint_course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blueprint_assignment" ADD CONSTRAINT "blueprint_assignment_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blueprint_assignment_problem" ADD CONSTRAINT "blueprint_assignment_problem_blueprint_assignment_id_fkey" FOREIGN KEY ("blueprint_assignment_id") REFERENCES "public"."blueprint_assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blueprint_assignment_problem" ADD CONSTRAINT "blueprint_assignment_problem_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Add Constraint
ALTER TABLE "public"."blueprint_assignment"
ADD CONSTRAINT blueprint_assignment_check_week_positive CHECK (week >= 1);

-- Add Constraint
-- Section(blueprint_course_id가 있는 강좌)은 분반 번호가 필수입니다.
-- UNIQUE(blueprint_course_id, class_num)는 class_num이 NULL이면 중복을 막지 못하므로 함께 둡니다.
-- 일반 강좌(blueprint_course_id IS NULL)는 기존처럼 class_num NULL을 허용합니다.
ALTER TABLE "public"."course_info"
ADD CONSTRAINT course_info_section_class_num_required
CHECK (blueprint_course_id IS NULL OR class_num IS NOT NULL);
