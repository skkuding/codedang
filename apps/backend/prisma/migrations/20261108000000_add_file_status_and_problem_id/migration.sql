-- File을 Problem에 귀속시키기 위한 상태와 관계를 추가한다.
-- 기존 레코드는 모두 Unmanaged / problem_id NULL이 되어 기존 동작은 바뀌지 않는다.

-- CreateEnum
CREATE TYPE "public"."FileStatus" AS ENUM ('Unmanaged', 'Temporary', 'Attached');

-- AlterTable
ALTER TABLE "public"."file" ADD COLUMN     "problem_id" INTEGER,
ADD COLUMN     "status" "public"."FileStatus" NOT NULL DEFAULT 'Unmanaged';

-- CreateIndex
CREATE INDEX "file_problem_id_idx" ON "public"."file"("problem_id");

-- AddForeignKey
-- 귀속 파일이 남아 있으면 Problem 삭제를 막는다. (File 먼저 정리 → Problem 삭제)
ALTER TABLE "public"."file" ADD CONSTRAINT "file_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint (Prisma가 표현하지 못하므로 직접 추가)
-- Attached일 때만 problem_id가 존재하고, 그 외 상태에서는 반드시 NULL이다.
ALTER TABLE "public"."file" ADD CONSTRAINT "file_status_problem_id_check"
CHECK (("status" = 'Attached') = ("problem_id" IS NOT NULL));
