#!/usr/bin/env bash

set -ex

BASEDIR=$(dirname $(dirname $(realpath $0)))

cd $BASEDIR

# Save database URL to dotenv file for Prisma
if [ -z $DEVCONTAINER ]
then
  echo "DATABASE_URL=\"postgresql://postgres:1234@localhost:5433/skkuding?schema=public\"" > backend/.env
  echo "DATABASE_URL=\"postgresql://postgres:1234@localhost:5434/skkuding?schema=public\"" > backend/.env.test.local
  docker-compose up -d dev-db
else
  echo "DATABASE_URL=\"postgresql://postgres:1234@dev-db:5432/skkuding?schema=public\"" > backend/.env
  echo "DATABASE_URL=\"postgresql://postgres:1234@test-db:5432/skkuding?schema=public\"" > backend/.env.test.local
fi

# Install pnpm
sudo corepack enable
corepack prepare pnpm@7.2.1 --activate
pnpm install

# Apply database migration
for i in {1..5}
do
  cd $BASEDIR/backend
  npx prisma migrate dev && break # break if migration succeed
  echo -e '\n⚠️ Failed to migrate. Waiting for db to be ready...\n'
  sleep 5
done
