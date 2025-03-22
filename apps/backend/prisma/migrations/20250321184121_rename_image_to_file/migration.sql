-- 테이블 이름 변경
ALTER TABLE "image" RENAME TO "file";

-- 기본키 이름 변경
ALTER TABLE "file" RENAME CONSTRAINT "image_pkey" TO "file_pkey";

-- 외래키 이름 변경
ALTER TABLE "file" RENAME CONSTRAINT "image_createdById_fkey" TO "file_createdById_fkey";

-- filename에 대한 인덱스 이름 변경
ALTER INDEX "image_filename_key" RENAME TO "file_filename_key";
