/*
  Warnings:

  - A unique constraint covering the columns `[nickname]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('CollegeStudent', 'HighSchoolStudent', 'Employee', 'Other');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "job_type" "public"."JobType" NOT NULL DEFAULT 'CollegeStudent',
ADD COLUMN     "nickname" TEXT;

-- AlterTable
ALTER TABLE "public"."user_profile" ADD COLUMN     "profile_image_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_nickname_key" ON "public"."user"("nickname");
