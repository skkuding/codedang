/*
  Warnings:

  - You are about to drop the column `invited_by` on the `polygon_collaborator` table. All the data in the column will be lost.
  - You are about to drop the column `solution` on the `polygon_problem` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."CollaboratorRole" ADD VALUE 'Owner';

-- DropForeignKey
ALTER TABLE "public"."polygon_collaborator" DROP CONSTRAINT "polygon_collaborator_invited_by_fkey";

-- AlterTable
ALTER TABLE "public"."polygon_collaborator" DROP COLUMN "invited_by";

-- AlterTable
ALTER TABLE "public"."polygon_problem" DROP COLUMN "solution";
