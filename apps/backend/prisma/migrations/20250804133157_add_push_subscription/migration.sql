-- CreateTable
CREATE TABLE "push_subscription" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscription_user_id_endpoint_key" ON "push_subscription"("user_id", "endpoint");

-- AddForeignKey
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
