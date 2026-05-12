/*
  Warnings:

  - A unique constraint covering the columns `[userNickname]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('CollegeStudent', 'HighSchoolStudent', 'Employee', 'Others');

-- CreateEnum
CREATE TYPE "public"."ProfileImageType" AS ENUM ('SYSTEM_GENERATED', 'UPLOAD');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "jobType" "public"."JobType" NOT NULL DEFAULT 'CollegeStudent',
ADD COLUMN     "userNickname" TEXT;

-- AlterTable
ALTER TABLE "public"."user_profile" ADD COLUMN     "profileImageKey" TEXT,
ADD COLUMN     "profileImageType" "public"."ProfileImageType" NOT NULL DEFAULT 'SYSTEM_GENERATED',
ADD COLUMN     "uploadedProfileImageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_userNickname_key" ON "public"."user"("userNickname");
