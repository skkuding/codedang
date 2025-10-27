-- AlterTable
ALTER TABLE "public"."problem" ADD COLUMN     "is_hidden_uploaded_by_zip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_sample_uploaded_by_zip" BOOLEAN NOT NULL DEFAULT false;
