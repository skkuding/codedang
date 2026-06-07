/*
  Warnings:

  - You are about to drop the column `total_study_time` on the `user_group` table. All the data in the column will be lost.
  - Added the required column `end_time` to the `study_info` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."study_info" ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_group" DROP COLUMN "total_study_time";
