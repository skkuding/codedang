/*
  Warnings:

  - A unique constraint covering the columns `[nickname]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nickname` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemImageSeed` to the `user_profile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('CollegeStudent', 'HighSchoolStudent', 'Employee', 'Other');

-- CreateEnum
CREATE TYPE "public"."ConsentType" AS ENUM ('TermsOfService', 'Privacy', 'MinorPrivacy', 'Marketing');

-- CreateEnum
CREATE TYPE "public"."ProfileImageType" AS ENUM ('System', 'Custom');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "jobType" "public"."JobType" NOT NULL DEFAULT 'CollegeStudent',
ADD COLUMN     "nickname" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_profile" ADD COLUMN     "customImageKey" TEXT,
ADD COLUMN     "profileImageType" "public"."ProfileImageType" NOT NULL DEFAULT 'System',
ADD COLUMN     "systemImageSeed" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."user_consent" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "public"."ConsentType" NOT NULL,
    "version" TEXT NOT NULL,
    "agreed" BOOLEAN NOT NULL,
    "agreed_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_consent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_consent_user_id_type_version_key" ON "public"."user_consent"("user_id", "type", "version");

-- CreateIndex
CREATE UNIQUE INDEX "user_nickname_key" ON "public"."user"("nickname");

-- AddForeignKey
ALTER TABLE "public"."user_consent" ADD CONSTRAINT "user_consent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
