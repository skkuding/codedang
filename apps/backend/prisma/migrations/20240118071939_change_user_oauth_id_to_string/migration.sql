/*
  Warnings:

  - The primary key for the `user_oauth` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "user_oauth" DROP CONSTRAINT "user_oauth_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_oauth_pkey" PRIMARY KEY ("id", "provider");
