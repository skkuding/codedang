/*
  contest 레코드가 생기기 전에 migration함
*/
-- AlterTable
ALTER TABLE "contest" DROP COLUMN "config",
ADD COLUMN     "isRankVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_visible" BOOLEAN NOT NULL DEFAULT true;
