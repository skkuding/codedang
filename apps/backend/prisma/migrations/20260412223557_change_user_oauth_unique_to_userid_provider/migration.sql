/*
  Warnings:

  - A unique constraint covering the columns `[user_id,provider]` on the table `user_oauth` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."user_oauth_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "user_oauth_user_id_provider_key" ON "public"."user_oauth"("user_id", "provider");
