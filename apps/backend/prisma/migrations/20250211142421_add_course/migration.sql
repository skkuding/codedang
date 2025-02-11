-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('Course', 'Study');

-- DropForeignKey
ALTER TABLE "user_group" DROP CONSTRAINT "user_group_group_id_fkey";

-- DropIndex
DROP INDEX "group_group_name_key";

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "group_type" "GroupType" NOT NULL DEFAULT 'Course',
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "can_create_contest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "can_create_course" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "course_info" (
    "group_id" INTEGER NOT NULL,
    "course_num" TEXT NOT NULL,
    "class_num" INTEGER,
    "professor" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "office" TEXT,
    "phone_num" TEXT,

    CONSTRAINT "course_info_pkey" PRIMARY KEY ("group_id")
);

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_info" ADD CONSTRAINT "course_info_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
