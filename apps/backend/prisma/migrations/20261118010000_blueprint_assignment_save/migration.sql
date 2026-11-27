-- AlterTable
ALTER TABLE "public"."blueprint_assignment" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."blueprint_assignment_save" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "blueprint_course_id" INTEGER NOT NULL,
    "blueprint_assignment_id" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL,
    "request_hash" TEXT NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blueprint_assignment_save_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blueprint_assignment_save_blueprint_assignment_id_idx" ON "public"."blueprint_assignment_save"("blueprint_assignment_id");
