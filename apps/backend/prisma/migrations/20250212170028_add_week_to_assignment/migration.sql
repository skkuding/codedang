-- AlterTable
ALTER TABLE "assignment" ADD COLUMN     "week" INTEGER;

-- AlterTable
ALTER TABLE "course_info" ADD COLUMN     "week" INTEGER NOT NULL DEFAULT 16;

-- CreateIndex
CREATE INDEX "assignment_group_id_week_idx" ON "assignment"("group_id", "week");

-- Add Constraint
ALTER TABLE "course_info"
ADD CONSTRAINT check_week_positive CHECK (week >= 1);
