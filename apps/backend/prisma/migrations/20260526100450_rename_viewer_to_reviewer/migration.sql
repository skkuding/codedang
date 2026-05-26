/*
  Warnings:

  - The values [Viewer] on the enum `CollaboratorRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CollaboratorRole_new" AS ENUM ('Owner', 'Editor', 'Reviewer');
ALTER TABLE "public"."polygon_collaborator" ALTER COLUMN "role" TYPE "public"."CollaboratorRole_new" USING ("role"::text::"public"."CollaboratorRole_new");
ALTER TYPE "public"."CollaboratorRole" RENAME TO "CollaboratorRole_old";
ALTER TYPE "public"."CollaboratorRole_new" RENAME TO "CollaboratorRole";
DROP TYPE "public"."CollaboratorRole_old";
COMMIT;
