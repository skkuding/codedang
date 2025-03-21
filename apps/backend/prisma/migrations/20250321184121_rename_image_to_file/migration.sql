/*
  Warnings:

  - You are about to drop the `image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_createdById_fkey";

-- DropTable
DROP TABLE "image";

-- CreateTable
CREATE TABLE "file" (
    "filename" TEXT NOT NULL,
    "createdById" INTEGER,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_pkey" PRIMARY KEY ("filename")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_filename_key" ON "file"("filename");

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
