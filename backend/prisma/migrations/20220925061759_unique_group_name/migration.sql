/*
  Warnings:

  - A unique constraint covering the columns `[group_name]` on the table `group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "group_group_name_key" ON "group"("group_name");
