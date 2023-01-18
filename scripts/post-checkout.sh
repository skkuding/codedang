#!/usr/bin/env bash

BASEDIR=$(dirname $(dirname $(realpath $0)))

cd $BASEDIR
pnpm install

# delete empty migration folders git has left
find $BASEDIR/backend/prisma/migrations -empty -type d -delete

if pnpm --filter backend exec prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --exit-code
then
  pnpm --filter backend exec prisma migrate reset
fi
