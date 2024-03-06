/*
  Warnings:

  - The values [GroupAdmin,SuperManager] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `is_group_manager` on the `user_group` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('User', 'Manager', 'Admin', 'SuperAdmin');
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'User';
COMMIT;

-- AlterTable
ALTER TABLE "user_group" DROP COLUMN "is_group_manager",
ADD COLUMN     "is_group_leader" BOOLEAN NOT NULL DEFAULT false;
