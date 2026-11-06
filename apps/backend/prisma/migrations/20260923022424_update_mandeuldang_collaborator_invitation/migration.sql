-- AlterEnum
ALTER TYPE "public"."CollaboratorStatus" ADD VALUE 'Rejected';

-- AlterTable
ALTER TABLE "public"."mandeuldang_collaborator" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "invited_at" TIMESTAMP(3),
ADD COLUMN     "invited_by_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."mandeuldang_collaborator" ADD CONSTRAINT "mandeuldang_collaborator_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
