import { connect } from 'amqplib'

const config = {
  host: process.env.RABBITMQ_HOST,
  port: process.env.RABBITMQ_PORT,
  username: process.env.RABBITMQ_DEFAULT_USER,
  password: process.env.RABBITMQ_DEFAULT_PASS,
  vhost: process.env.RABBITMQ_DEFAULT_VHOST
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

async function setupRabbitMQ() {
  const url = `amqp://${config.username}:${config.password}@${config.host}:${config.port}/${config.vhost}`
  const connection = await connect(url)

  try {
    const channel = await connection.createChannel()

    console.log('Connection to RabbitMQ successful.')

    const exchangeName = requireEnv('JUDGE_EXCHANGE_NAME')
    await channel.assertExchange(exchangeName, 'direct', { durable: true })

    const resultQueueName = requireEnv('JUDGE_RESULT_QUEUE_NAME')
    await channel.assertQueue(resultQueueName, { durable: true })

    const resultRoutingKey = requireEnv('JUDGE_RESULT_ROUTING_KEY')
    await channel.bindQueue(resultQueueName, exchangeName, resultRoutingKey)

    const submissionRoutingKey =
      process.env.SUBMISSION_KEY ??
      process.env.JUDGE_SUBMISSION_ROUTING_KEY ??
      'judge.submission'
    const requestQueues: { name: string; routingKey: string }[] = [
      {
        name: requireEnv('JUDGE_SUBMISSION_QUEUE_NAME'),
        routingKey: submissionRoutingKey
      }
    ]

    const testRoutingKey = process.env.TEST_KEY
    if (testRoutingKey && testRoutingKey !== submissionRoutingKey) {
      requestQueues.push({
        name: requireEnv('JUDGE_TEST_QUEUE_NAME'),
        routingKey: testRoutingKey
      })
    }

    const rejudgeRoutingKey = process.env.REJUDGE_KEY
    if (rejudgeRoutingKey && rejudgeRoutingKey !== submissionRoutingKey) {
      requestQueues.push({
        name: requireEnv('JUDGE_REJUDGE_QUEUE_NAME'),
        routingKey: rejudgeRoutingKey
      })
    }

    for (const requestQueue of requestQueues) {
      await channel.assertQueue(requestQueue.name, { durable: true })
      await channel.bindQueue(
        requestQueue.name,
        exchangeName,
        requestQueue.routingKey
      )
    }

    const checkExchangeName = requireEnv('CHECK_EXCHANGE_NAME')
    await channel.assertExchange(checkExchangeName, 'direct', { durable: true })

    const checkResultQueueName = requireEnv('CHECK_RESULT_QUEUE_NAME')
    await channel.assertQueue(checkResultQueueName, { durable: true })

    const checkRequestQueueName = requireEnv('CHECK_QUEUE_NAME')
    await channel.assertQueue(checkRequestQueueName, {
      durable: true,
      arguments: { 'x-max-priority': 1 }
    })

    const checkResultRoutingKey = requireEnv('CHECK_RESULT_ROUTING_KEY')
    await channel.bindQueue(
      checkResultQueueName,
      checkExchangeName,
      checkResultRoutingKey
    )

    const checkRequestRoutingKey = requireEnv('CHECK_ROUTING_KEY')
    await channel.bindQueue(
      checkRequestQueueName,
      checkExchangeName,
      checkRequestRoutingKey
    )

    console.log('RabbitMQ topology setup complete.')
  } catch (error) {
    console.error('❌ Failed to setup RabbitMQ topology:', error)
    process.exit(1)
  } finally {
    await connection.close()
  }
}

// Execute the setup function
setupRabbitMQ()
