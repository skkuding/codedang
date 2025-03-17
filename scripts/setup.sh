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

# Add APP_ENV=local to .env file
echo "APP_ENV=local" >> .env

# If dotenv schema is not updated, remove the file
if [ -f apps/backend/.env ] && grep -q DATABASE_URL apps/backend/.env
then
  rm apps/backend/.env
fi

# If .env does not exist, create one
if [ ! -f apps/backend/.env ]
then
  echo "NODEMAILER_HOST=\"email-smtp.ap-northeast-2.amazonaws.com\"" >> apps/backend/.env
  echo "NODEMAILER_USER=\"\"" >> apps/backend/.env
  echo "NODEMAILER_PASS=\"\"" >> apps/backend/.env
  echo "NODEMAILER_FROM=\"\"" >> apps/backend/.env
  echo "JWT_SECRET=$(head -c 64 /dev/urandom | LC_ALL=C tr -dc A-Za-z0-9 | sha256sum | head -c 64)" >> apps/backend/.env
fi

# Install pnpm and Node.js packages
npm install -g pnpm@latest
pnpm install

# Install lefthook for git hook
pnpm exec lefthook install

# Init MinIO
pnpm run init:storage

# Set NODE_OPTIONS to increase memory limit for frontend build (next build)
echo "export NODE_OPTIONS=--max-old-space-size=4096" >> ~/.bashrc

# Enable git auto completion
if ! grep -q "bash-completion/completions/git" ~/.bashrc
then
  echo "source /usr/share/bash-completion/completions/git" >> ~/.bashrc
fi

# Set aws profile for terraform as skkuding
echo "export AWS_PROFILE=skkuding" >> ~/.bashrc

# Apply database migration
for i in {1..5}
do
  pnpm --filter="@codedang/backend" exec prisma migrate dev && break # break if migration succeed
  echo -e '\n⚠️ Failed to migrate. Waiting for db to be ready...\n'
  sleep 5
done

# Install Go dependencies
cd $BASEDIR/apps/iris
go get

# Setup sandbox
cp $BASEDIR/apps/iris/lib/judger/policy/java_policy /app/sandbox/policy/

# 컨테이너 ID 추출 (예: /proc/self/cgroup에서 추출)
CONTAINER_ID=$(head -1 /proc/self/cgroup | cut -d/ -f3)
# docker- 접두사와 .scope 접미사 제거 (예: docker-5340af7...scope -> 5340af7...)
CONTAINER_ID=$(echo "$CONTAINER_ID" | sed -e 's/docker-\(.*\)\.scope/\1/')
echo "Container ID: $CONTAINER_ID"

# 고유 cgroup 디렉터리 생성 (예: /sys/fs/cgroup/sandbox-${CONTAINER_ID})
SANDBOX_CG="/sys/fs/cgroup/sandbox-${CONTAINER_ID}"
if [ ! -d "$SANDBOX_CG" ]; then
    if [ "$(id -u)" -eq 0 ]; then
        # 현재 사용자가 root인 경우 sudo 없이 생성
        mkdir -p "$SANDBOX_CG" || { echo "Failed to create cgroup directory $SANDBOX_CG" >&2; exit 1; }
    else
        # root가 아닌 경우, sudo가 있으면 sudo 사용
        if command -v sudo >/dev/null 2>&1; then
            sudo mkdir -p "$SANDBOX_CG" || { echo "Failed to create cgroup directory $SANDBOX_CG" >&2; exit 1; }
        else
            echo "Error: not running as root and sudo is not available to create $SANDBOX_CG" >&2
            exit 1
        fi
    fi
    echo "Created cgroup directory $SANDBOX_CG"
fi

# CONTAINER_ID를 환경 변수로 설정하고 ~/.bashrc에 추가
echo "export CONTAINER_ID=$CONTAINER_ID" >> ~/.bashrc
export CONTAINER_ID
source ~/.bashrc

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
  declare queue name="$JUDGE_SUBMISSION_QUEUE_NAME" durable=true arguments='{"x-max-priority": 3}'

# Make bindings
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare binding source="$JUDGE_EXCHANGE_NAME" destination_type=queue destination="$JUDGE_RESULT_QUEUE_NAME" routing_key="$JUDGE_RESULT_ROUTING_KEY"
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare binding source="$JUDGE_EXCHANGE_NAME" destination_type=queue destination="$JUDGE_SUBMISSION_QUEUE_NAME" routing_key="$JUDGE_SUBMISSION_ROUTING_KEY"

# Allow direnv
cd $BASEDIR
direnv allow
