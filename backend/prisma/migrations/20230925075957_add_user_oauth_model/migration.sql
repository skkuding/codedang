-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('github', 'kakao', 'naver', 'google');

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "user_oauth" (
    "id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "Provider" NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_oauth_pkey" PRIMARY KEY ("id","provider")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_oauth_user_id_key" ON "user_oauth"("user_id");

-- AddForeignKey
ALTER TABLE "user_oauth" ADD CONSTRAINT "user_oauth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
