/*
  Warnings:

  - The values [Failed] on the enum `CheckResultStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `PlagiarismCluster` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCluster` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CheckResultStatus_new" AS ENUM ('Pending', 'Completed', 'JplagError', 'ServerError');
ALTER TABLE "check_request" ALTER COLUMN "result" TYPE "CheckResultStatus_new" USING ("result"::text::"CheckResultStatus_new");
ALTER TYPE "CheckResultStatus" RENAME TO "CheckResultStatus_old";
ALTER TYPE "CheckResultStatus_new" RENAME TO "CheckResultStatus";
DROP TYPE "CheckResultStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "UserCluster" DROP CONSTRAINT "UserCluster_cluster_id_fkey";

-- DropForeignKey
ALTER TABLE "UserCluster" DROP CONSTRAINT "UserCluster_user_id_fkey";

-- DropForeignKey
ALTER TABLE "check_result" DROP CONSTRAINT "check_result_cluster_id_fkey";

-- DropTable
DROP TABLE "PlagiarismCluster";

-- DropTable
DROP TABLE "UserCluster";

-- CreateTable
CREATE TABLE "plagiarism_cluster" (
    "id" SERIAL NOT NULL,
    "average_similarity" DOUBLE PRECISION,
    "second_user_id" DOUBLE PRECISION,

    CONSTRAINT "plagiarism_cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_Cluster" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cluster_id" INTEGER NOT NULL,

    CONSTRAINT "user_Cluster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "check_result" ADD CONSTRAINT "check_result_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "plagiarism_cluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_Cluster" ADD CONSTRAINT "user_Cluster_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_Cluster" ADD CONSTRAINT "user_Cluster_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "plagiarism_cluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
