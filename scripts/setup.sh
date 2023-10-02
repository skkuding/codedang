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

# Write .env file from .env.development
if [ -f .env ]
then
  rm .env
fi

while IFS= read -r line
do
  # Skip empty lines or comments
  if [[ -z "$line" || ${line:0:1} == '#' ]]
  then
    continue
  fi

  name=${line%%=*}
  value=${line#*=}

  if [[ -v "$name" ]]
  then
      echo "$name=${!name}" >> .env
  else
      echo "$name=$value" >> .env
  fi
done < .env.development

# If dotenv schema is not updated, remove the file
if [ -f backend/.env ] && grep -q DATABASE_URL backend/.env
then
  rm backend/.env
fi

# If .env does not exist, create one
if [ ! -f backend/.env ]
then
  echo "NODEMAILER_HOST=\"email-smtp.ap-northeast-2.amazonaws.com\"" >> backend/.env
  echo "NODEMAILER_USER=\"\"" >> backend/.env
  echo "NODEMAILER_PASS=\"\"" >> backend/.env
  echo "NODEMAILER_FROM=\"\"" >> backend/.env
  echo "JWT_SECRET=$(head -c 64 /dev/urandom | LC_ALL=C tr -dc A-Za-z0-9 | sha256sum | head -c 64)" >> backend/.env
fi

# Generate thunder client environment
# Since environment variable changes frequently, let git ignore actual environment variables
cp thunder-tests/environments/base.json thunder-tests/environments/tc_env_coding-platform-env.json

# Install pnpm and Node.js packages
npm install -g pnpm@latest
pnpm install

# Install lefthook for git hook
pnpm exec lefthook install

# Upload testcases to MinIO
pnpm run init:testcases

# Enable git auto completion
if ! grep -q "bash-completion/completions/git" ~/.bashrc
then
  echo "source /usr/share/bash-completion/completions/git" >> ~/.bashrc
fi

# Apply database migration
for i in {1..5}
do
  pnpm --filter backend exec prisma migrate dev && break # break if migration succeed
  echo -e '\n⚠️ Failed to migrate. Waiting for db to be ready...\n'
  sleep 5
done

# Install Go dependencies
cd $BASEDIR/iris
go get

# Setup sandbox
cp $BASEDIR/iris/lib/judger/policy/java_policy /app/sandbox/policy/

# Check RabbitMQ connection
while ! nc -z "$RABBITMQ_HOST" "$RABBITMQ_PORT"; do sleep 3; done
echo "rabbitmq is up - server running..."

# Make an Exchange
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare exchange name=$JUDGE_EXCHANGE_NAME type=direct

# Make queues
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare queue name="$JUDGE_RESULT_QUEUE_NAME" durable=true
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare queue name="$JUDGE_SUBMISSION_QUEUE_NAME" durable=true

# Make bindings
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare binding source="$JUDGE_EXCHANGE_NAME" destination_type=queue destination="$JUDGE_RESULT_QUEUE_NAME" routing_key="$JUDGE_RESULT_ROUTING_KEY"
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare binding source="$JUDGE_EXCHANGE_NAME" destination_type=queue destination="$JUDGE_SUBMISSION_QUEUE_NAME" routing_key="$JUDGE_SUBMISSION_ROUTING_KEY"
