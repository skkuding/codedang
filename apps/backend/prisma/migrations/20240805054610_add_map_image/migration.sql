/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_createdById_fkey";

-- DropTable
DROP TABLE "Image";

-- CreateTable
CREATE TABLE "image" (
    "filename" TEXT NOT NULL,
    "createdById" INTEGER,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_pkey" PRIMARY KEY ("filename")
);

-- CreateIndex
CREATE UNIQUE INDEX "image_filename_key" ON "image"("filename");

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
