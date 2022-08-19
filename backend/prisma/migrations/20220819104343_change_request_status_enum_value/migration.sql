/*
  Warnings:

  - The values [Accept,Reject] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('Pending', 'Accepted', 'Rejected');
ALTER TABLE "contest_to_public_request" ALTER COLUMN "request_status" DROP DEFAULT;
ALTER TABLE "contest_to_public_request" ALTER COLUMN "request_status" TYPE "RequestStatus_new" USING ("request_status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "contest_to_public_request" ALTER COLUMN "request_status" SET DEFAULT 'Pending';
COMMIT;
