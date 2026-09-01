# Iris local judge workers

Iris is configured as a generic judge request consumer. The queue it consumes
is selected by `JUDGE_REQUEST_*`; it always publishes results through
`JUDGE_RESULT_*`.

## Split local topology

After loading the root `.envrc` and starting local RabbitMQ, initialize the
three request queues and the shared result queue:

```sh
pnpm init:rabbitmq
```

Start one process for each workload in separate terminals:

```sh
# submission
go run .

# test
JUDGE_REQUEST_CONSUMER_CONNECTION_NAME=iris-test-consumer \
JUDGE_REQUEST_QUEUE_NAME="$JUDGE_TEST_QUEUE_NAME" \
JUDGE_REQUEST_CONSUMER_TAG=iris-test-consumer-tag \
go run .

# rejudge
JUDGE_REQUEST_CONSUMER_CONNECTION_NAME=iris-rejudge-consumer \
JUDGE_REQUEST_QUEUE_NAME="$JUDGE_REJUDGE_QUEUE_NAME" \
JUDGE_REQUEST_CONSUMER_TAG=iris-rejudge-consumer-tag \
go run .
```

`SUBMISSION_KEY`, `TEST_KEY`, and `REJUDGE_KEY` default to distinct routing
keys in `.envrc`, so each workload reaches only its corresponding queue.

## Legacy single-queue mode

To reproduce the pre-split local topology, omit the new test and rejudge keys
or set them equal to `SUBMISSION_KEY` before initializing RabbitMQ, then run
only the submission worker:

```sh
unset TEST_KEY REJUDGE_KEY
pnpm init:rabbitmq
go run .
```

Nest falls back to `JUDGE_SUBMISSION_ROUTING_KEY`, so submission, test, and
rejudge requests are all routed to the submission queue.
