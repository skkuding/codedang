/*
  Warnings:

  - The primary key for the `submission_Cluster` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `submission_Cluster` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."submission_Cluster" DROP CONSTRAINT "submission_Cluster_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "submission_Cluster_pkey" PRIMARY KEY ("submission_id", "cluster_id");
