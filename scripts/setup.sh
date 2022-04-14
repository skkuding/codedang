#!/usr/bin/env bash

# set -x

BASEDIR=$(dirname $(dirname $(realpath $0)))

cd $BASEDIR/backend

# Save database URL to dotenv file for Prisma
echo "DATABASE_URL=\"postgresql://postgres:1234@localhost:5433/skkuding?schema=public\"" > .env
echo "DATABASE_URL=\"postgresql://postgres:1234@localhost:5434/skkuding?schema=public\"" > .env.test.local

docker-compose up dev-db -d

pnpm install

for i in {1..5}
do
  npx prisma migrate deploy && break # break if migration succeed
  echo -e '\n⚠️ Failed to migrate. Waiting for db to be ready...\n'
  sleep 5
done
