-- AlterTable
ALTER TABLE "public"."course_notice" ADD COLUMN     "blueprint_notice_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."blueprint_notice" (
    "id" SERIAL NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "blueprint_course_id" INTEGER NOT NULL,
    "created_by_id" INTEGER,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blueprint_notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blueprint_notice_save" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "blueprint_course_id" INTEGER NOT NULL,
    "blueprint_notice_id" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL,
    "request_hash" TEXT NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blueprint_notice_save_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blueprint_notice_blueprint_course_id_idx" ON "public"."blueprint_notice"("blueprint_course_id");

-- CreateIndex
CREATE INDEX "blueprint_notice_save_blueprint_notice_id_idx" ON "public"."blueprint_notice_save"("blueprint_notice_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_notice_blueprint_notice_id_group_id_key" ON "public"."course_notice"("blueprint_notice_id", "group_id");

-- AddForeignKey
ALTER TABLE "public"."course_notice" ADD CONSTRAINT "course_notice_blueprint_notice_id_fkey" FOREIGN KEY ("blueprint_notice_id") REFERENCES "public"."blueprint_notice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blueprint_notice" ADD CONSTRAINT "blueprint_notice_blueprint_course_id_fkey" FOREIGN KEY ("blueprint_course_id") REFERENCES "public"."blueprint_course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blueprint_notice" ADD CONSTRAINT "blueprint_notice_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

