/*
  Warnings:

  - You are about to drop the column `type` on the `tag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `tag` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tag" DROP COLUMN "type";

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");
