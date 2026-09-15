/*
  Warnings:

  - You are about to drop the column `file_path` on the `polygon_solution` table. All the data in the column will be lost.
  - You are about to drop the column `file_path` on the `polygon_tool` table. All the data in the column will be lost.
  - Added the required column `file_content` to the `polygon_solution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_content` to the `polygon_tool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."polygon_solution" DROP COLUMN "file_path",
ADD COLUMN     "file_content" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."polygon_tool" DROP COLUMN "file_path",
ADD COLUMN     "file_content" TEXT NOT NULL;
