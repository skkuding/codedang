/*
  Warnings:

  - You are about to drop the column `customImageKey` on the `user_profile` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageType` on the `user_profile` table. All the data in the column will be lost.
  - You are about to drop the column `systemImageSeed` on the `user_profile` table. All the data in the column will be lost.
  - You are about to drop the `user_consent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `profile_image_ref` to the `user_profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."user_consent" DROP CONSTRAINT "user_consent_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."user_profile" DROP COLUMN "customImageKey",
DROP COLUMN "profileImageType",
DROP COLUMN "systemImageSeed",
ADD COLUMN     "profile_image_ref" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."user_consent";

-- DropEnum
DROP TYPE "public"."ConsentType";

-- DropEnum
DROP TYPE "public"."ProfileImageType";
