#!/usr/bin/env bash
set -a

source .env.development

wget -qO- https://get.pnpm.io/install.sh | sh
pnpm install

# Node.js 설치
pnpm env use --global lts

# 테스트케이스 업로드
pnpm run init:testcases

# 데이터베이스 마이그레이션
pnpm --filter backend exec prisma migrate reset -f

sudo curl https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/main/deps/rabbitmq_management/bin/rabbitmqadmin -o /usr/local/bin/rabbitmqadmin
sudo chmod 755 /usr/local/bin/rabbitmqadmin

# RabbitMQ 세팅
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare exchange name=$JUDGE_EXCHANGE_NAME type=direct

rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare queue name="$JUDGE_RESULT_QUEUE_NAME" durable=true
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare queue name="$JUDGE_SUBMISSION_QUEUE_NAME" durable=true

rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare binding source="$JUDGE_EXCHANGE_NAME" destination_type=queue destination="$JUDGE_RESULT_QUEUE_NAME" routing_key="$JUDGE_RESULT_ROUTING_KEY"
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare binding source="$JUDGE_EXCHANGE_NAME" destination_type=queue destination="$JUDGE_SUBMISSION_QUEUE_NAME" routing_key="$JUDGE_SUBMISSION_ROUTING_KEY"

set +a
