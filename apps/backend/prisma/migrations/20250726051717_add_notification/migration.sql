-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Announcement', 'Assignment', 'Contest', 'Course', 'Other');

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "url" TEXT,
    "type" "NotificationType" NOT NULL DEFAULT 'Other',
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_record" (
    "id" SERIAL NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_record_user_id_create_time_id_idx" ON "notification_record"("user_id", "create_time", "id");

-- AddForeignKey
ALTER TABLE "notification_record" ADD CONSTRAINT "notification_record_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_record" ADD CONSTRAINT "notification_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
