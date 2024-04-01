/*
  Warnings:

  - You are about to drop the column `invitation_code` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `private` on the `group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "group" DROP COLUMN "invitation_code",
DROP COLUMN "private",
ADD COLUMN     "config" JSONB;
