-- DropIndex
DROP INDEX "public"."user_nickname_key";

-- Set default nickname to username for users
UPDATE "public"."user" SET "nickname" = "username";

-- Make nickname not null
ALTER TABLE "public"."user" ALTER "nickname" SET NOT NULL
