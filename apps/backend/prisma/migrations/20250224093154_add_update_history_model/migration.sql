/*
  Warnings:

  - You are about to drop the column `currentDescription` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `currentHint` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `currentLanguage` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `currentMemoryLimit` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `currentTimeLimit` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `currentTitle` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `isDescriptionChanged` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `isHintChanged` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `isLanguageChanged` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `isLimitChanged` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `isTitleChanged` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `prevDescription` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `prevHint` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `prevLanguage` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `prevMemoryLimit` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `prevTimeLimit` on the `updateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `prevTitle` on the `updateHistory` table. All the data in the column will be lost.
  - The `updated_fields` column on the `updateHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedByid` to the `updateHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "updateHistory" DROP COLUMN "currentDescription",
DROP COLUMN "currentHint",
DROP COLUMN "currentLanguage",
DROP COLUMN "currentMemoryLimit",
DROP COLUMN "currentTimeLimit",
DROP COLUMN "currentTitle",
DROP COLUMN "isDescriptionChanged",
DROP COLUMN "isHintChanged",
DROP COLUMN "isLanguageChanged",
DROP COLUMN "isLimitChanged",
DROP COLUMN "isTitleChanged",
DROP COLUMN "prevDescription",
DROP COLUMN "prevHint",
DROP COLUMN "prevLanguage",
DROP COLUMN "prevMemoryLimit",
DROP COLUMN "prevTimeLimit",
DROP COLUMN "prevTitle",
ADD COLUMN     "updatedByid" INTEGER NOT NULL,
ADD COLUMN     "updatedInfo" JSONB[],
DROP COLUMN "updated_fields",
ADD COLUMN     "updated_fields" TEXT[];

-- AddForeignKey
ALTER TABLE "updateHistory" ADD CONSTRAINT "updateHistory_updatedByid_fkey" FOREIGN KEY ("updatedByid") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
