-- CreateTable
CREATE TABLE "_GroupToProblem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GroupToProblem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupToProblem_B_index" ON "_GroupToProblem"("B");

-- AddForeignKey
ALTER TABLE "_GroupToProblem" ADD CONSTRAINT "_GroupToProblem_A_fkey" FOREIGN KEY ("A") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToProblem" ADD CONSTRAINT "_GroupToProblem_B_fkey" FOREIGN KEY ("B") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
