#!/bin/sh
set -ex

while ! nc -z "$RABBITMQ_HOST" "$RABBITMQ_PORT"; do sleep 3; done
echo "rabbitmq is up - server running..."

# install rabbitmqadmin
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
