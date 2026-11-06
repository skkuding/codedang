/*
  Warnings:

  - You are about to drop the column `file_content` on the `mandeuldang_solution` table. All the data in the column will be lost.
  - You are about to drop the column `file_content` on the `mandeuldang_tool` table. All the data in the column will be lost.
  - Added the required column `file_path` to the `mandeuldang_solution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_path` to the `mandeuldang_tool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."mandeuldang_solution" DROP COLUMN "file_content",
ADD COLUMN     "file_path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."mandeuldang_tool" DROP COLUMN "file_content",
ADD COLUMN     "file_path" TEXT NOT NULL;
