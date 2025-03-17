-- AlterTable
ALTER TABLE "contest" ADD COLUMN     "unfreeze" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "penalty" SET DEFAULT 20;
