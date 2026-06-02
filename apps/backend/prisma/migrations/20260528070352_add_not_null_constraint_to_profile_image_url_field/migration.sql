/*
  Warnings:

  - Made the column `profile_image_url` on table `user_profile` required. This step will fail if there are existing NULL values in that column.

*/

-- Set default profileImageUrl seed to username for users
UPDATE "public"."user_profile"
SET "profile_image_url" = 'https://api.dicebear.com/9.x/notionists/svg?seed=' || (
  SELECT "username" FROM "public"."user" WHERE "user"."id" = "user_profile"."user_id"
)
WHERE "profile_image_url" IS NULL;

-- Make profileImageUrl not null
ALTER TABLE "public"."user_profile" ALTER COLUMN "profile_image_url" SET NOT NULL;



