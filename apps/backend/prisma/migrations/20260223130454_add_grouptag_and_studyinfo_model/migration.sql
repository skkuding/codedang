-- CreateTable
CREATE TABLE "public"."group_tag" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "group_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."study_info" (
    "group_id" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "invitation_code" TEXT,

    CONSTRAINT "study_info_pkey" PRIMARY KEY ("group_id")
);

-- AddForeignKey
ALTER TABLE "public"."group_tag" ADD CONSTRAINT "group_tag_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_tag" ADD CONSTRAINT "group_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."study_info" ADD CONSTRAINT "study_info_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
