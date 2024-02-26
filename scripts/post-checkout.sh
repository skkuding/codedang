#!/usr/bin/env bash

BASEDIR=$(dirname $(dirname $(realpath $0)))

cd $BASEDIR
pnpm install

# delete empty migration folders git has left
find $BASEDIR/apps/backend/prisma/migrations -empty -type d -delete

if [ -n "$DATABASE_URL" ]
then
  pnpm --filter apps/backend --silent exec prisma migrate diff \
  --from-url $DATABASE_URL \
  --to-migrations prisma/migrations \
  --shadow-database-url $DATABASE_URL \
  --exit-code && \
  pnpm --filter apps/backend exec prisma migrate reset -f
fi
