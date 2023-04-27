#!/usr/bin/env bash

set -ex

# Check requirements: npm
if [ ! $(command -v npm) ]
then
  echo "Error: npm is not installed. Please install npm first."
  exit 1
fi

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

# Save user account and password to dotenv file for nodemailer
echo "NODEMAILER_USER=\"\"" >> backend/.env
echo "NODEMAILER_PASS=\"\"" >> backend/.env

# Use docker-compose profile
if [ -z $DEVCONTAINER ]
then
  docker compose up -d
fi

echo "JWT_SECRET=$(head -c 64 /dev/urandom | LC_ALL=C tr -dc A-Za-z0-9 | sha256sum | head -c 64)" >> backend/.env

# Generate thunder client environment
# Since environment variable changes frequently, let git ignore actual environment variables
cp thunder-tests/thunderEnvironmentBase.json thunder-tests/thunderEnvironment.json

# Install pnpm and Node.js packages
npm install -g pnpm@8
pnpm install

# Install lefthook for git hook
pnpm exec lefthook install

# Apply database migration
for i in {1..5}
do
  pnpm --filter backend exec prisma generate \
    && pnpm --filter backend exec prisma migrate dev \
    && break # break if migration succeed
  echo -e '\n⚠️ Failed to migrate. Waiting for db to be ready...\n'
  sleep 5
done
