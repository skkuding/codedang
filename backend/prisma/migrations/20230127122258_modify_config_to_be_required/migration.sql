/*
  Warnings:

  - Made the column `config` on table `group` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "group" ALTER COLUMN "config" SET NOT NULL;
