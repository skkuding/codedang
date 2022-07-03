#!/usr/bin/env bash

set -ex

BASEDIR=$(dirname $(dirname $(realpath $0)))

cd $BASEDIR

# Save database URL to dotenv file for Prisma
if [ -z $DEVCONTAINER ]
then
  echo "DATABASE_URL=\"postgresql://postgres:1234@localhost:5433/skkuding?schema=public\"" > backend/.env
  echo "DATABASE_URL=\"postgresql://postgres:1234@localhost:5434/skkuding?schema=public\"" > backend/.env.test.local
else
  echo "DATABASE_URL=\"postgresql://postgres:1234@dev-db:5432/skkuding?schema=public\"" > backend/.env
  echo "DATABASE_URL=\"postgresql://postgres:1234@test-db:5432/skkuding?schema=public\"" > backend/.env.test.local
fi

# Save cache database URL and PORT to dotenv file
if [ -z $DEVCONTAINER ]
then
  echo "CACHE_DATABASE_URL=\"localhost\"" >> backend/.env
  echo "CACHE_DATABASE_PORT=6380" >> backend/.env
else
  echo "CACHE_DATABASE_URL=\"skkuding-dev-cache\"" >> backend/.env
  echo "CACHE_DATABASE_PORT=6379" >> backend/.env
fi

# Use docker-compose profile
if [ -z $DEVCONTAINER ]
then
  docker-compose up -d
fi

# Install pnpm
pnpm --version || sudo corepack enable
corepack prepare pnpm@7.2.1 --activate
pnpm install

# Install lefthook for git hook
npx lefthook install

# Apply database migration
for i in {1..5}
do
  cd $BASEDIR/backend
  npx prisma migrate dev && break # break if migration succeed
  echo -e '\n⚠️ Failed to migrate. Waiting for db to be ready...\n'
  sleep 5
done
