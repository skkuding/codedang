-- CreateTable
CREATE TABLE "updateHistory" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_fields" JSONB NOT NULL,
    "isTitleChanged" BOOLEAN NOT NULL DEFAULT false,
    "isLanguageChanged" BOOLEAN NOT NULL DEFAULT false,
    "isDescriptionChanged" BOOLEAN NOT NULL DEFAULT false,
    "isLimitChanged" BOOLEAN NOT NULL DEFAULT false,
    "isHintChanged" BOOLEAN NOT NULL DEFAULT false,
    "currentTitle" TEXT,
    "currentLanguage" JSONB,
    "currentDescription" TEXT,
    "currentTimeLimit" INTEGER,
    "currentMemoryLimit" INTEGER,
    "currentHint" TEXT,
    "prevTitle" TEXT,
    "prevLanguage" JSONB,
    "prevDescription" TEXT,
    "prevTimeLimit" INTEGER,
    "prevMemoryLimit" INTEGER,
    "prevHint" TEXT,

    CONSTRAINT "updateHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "updateHistory" ADD CONSTRAINT "updateHistory_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
