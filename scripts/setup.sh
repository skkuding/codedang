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

# Save user account and password to dotenv file for nodemailer
echo "NODEMAILER_HOST=\"email-smtp.ap-northeast-2.amazonaws.com\"" >> backend/.env
echo "NODEMAILER_USER=\"\"" >> backend/.env
echo "NODEMAILER_PASS=\"\"" >> backend/.env
echo "NODEMAILER_FROM=\"\"" >> backend/.env

# Use docker-compose profile
if [ -z $DEVCONTAINER ]
then
  docker compose up -d
fi

echo "JWT_SECRET=$(head -c 64 /dev/urandom | LC_ALL=C tr -dc A-Za-z0-9 | sha256sum | head -c 64)" >> backend/.env

# Generate thunder client environment
# Since environment variable changes frequently, let git ignore actual environment variables
cp thunder-tests/environments/base.json thunder-tests/environments/tc_env_coding-platform-env.json

# Install pnpm and Node.js packages
npm install -g pnpm@latest
pnpm install

# Install lefthook for git hook
pnpm exec lefthook install

# Enable git auto completion
echo "source /usr/share/bash-completion/completions/git" >> ~/.bashrc

# Apply database migration
for i in {1..5}
do
  pnpm --filter backend exec prisma generate \
    && pnpm --filter backend exec prisma migrate dev \
    && break # break if migration succeed
  echo -e '\n⚠️ Failed to migrate. Waiting for db to be ready...\n'
  sleep 5
done

# Install Go dependencies
cd $BASEDIR/Iris
go get

# Setup sandbox
cp $BASEDIR/Iris/lib/judger/policy/java_policy /app/sandbox/policy/

# Check RabbitMQ connection
while ! nc -z "$RABBITMQ_HOST" "$RABBITMQ_PORT"; do sleep 3; done
echo "rabbitmq is up - server running..."

# Install rabbitmqadmin CLI tool
wget http://$RABBITMQ_HOST:15672/cli/rabbitmqadmin
chmod +x rabbitmqadmin

# Make an Exchange
./rabbitmqadmin -H "$RABBITMQ_HOST" -u "$RABBITMQ_DEFAULT_USER" -p $RABBITMQ_DEFAULT_PASS declare exchange name="$JUDGE_EXCHANGE_NAME" type=direct

# Make queues
./rabbitmqadmin -H "$RABBITMQ_HOST" -u "$RABBITMQ_DEFAULT_USER" -p $RABBITMQ_DEFAULT_PASS declare queue name="$JUDGE_RESULT_QUEUE_NAME" durable=true
./rabbitmqadmin -H "$RABBITMQ_HOST" -u "$RABBITMQ_DEFAULT_USER" -p $RABBITMQ_DEFAULT_PASS declare queue name="$JUDGE_SUBMISSION_QUEUE_NAME" durable=true

# Make bindings
./rabbitmqadmin -H "$RABBITMQ_HOST" -u "$RABBITMQ_DEFAULT_USER" -p $RABBITMQ_DEFAULT_PASS declare binding source="$JUDGE_EXCHANGE_NAME"\
                                destination_type=queue destination="$JUDGE_RESULT_QUEUE_NAME" routing_key="$JUDGE_RESULT_ROUTING_KEY"
./rabbitmqadmin -H "$RABBITMQ_HOST" -u "$RABBITMQ_DEFAULT_USER" -p $RABBITMQ_DEFAULT_PASS declare binding source="$JUDGE_EXCHANGE_NAME"\
                                destination_type=queue destination="$JUDGE_SUBMISSION_QUEUE_NAME" routing_key="$JUDGE_SUBMISSION_ROUTING_KEY"

rm rabbitmqadmin
