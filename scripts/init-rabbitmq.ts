import { connect } from 'amqplib'

const config = {
  host: process.env.RABBITMQ_HOST,
  port: process.env.RABBITMQ_PORT,
  username: process.env.RABBITMQ_DEFAULT_USER,
  password: process.env.RABBITMQ_DEFAULT_PASS,
  vhost: process.env.RABBITMQ_DEFAULT_VHOST
}

async function setupRabbitMQ() {
  const url = `amqp://${config.username}:${config.password}@${config.host}:${config.port}/${config.vhost}`
  const connection = await connect(url)

  try {
    const channel = await connection.createChannel()

    console.log('Connection to RabbitMQ successful.')

    const exchangeName = process.env.JUDGE_EXCHANGE_NAME!
    await channel.assertExchange(exchangeName, 'direct', { durable: true })

    const resultQueueName = process.env.JUDGE_RESULT_QUEUE_NAME!
    await channel.assertQueue(resultQueueName, { durable: true })

    const submissionQueueName = process.env.JUDGE_SUBMISSION_QUEUE_NAME!
    await channel.assertQueue(submissionQueueName, {
      durable: true,
      arguments: { 'x-max-priority': 3 }
    })

    const resultRoutingKey = process.env.JUDGE_RESULT_ROUTING_KEY!
    await channel.bindQueue(resultQueueName, exchangeName, resultRoutingKey)

    const submissionRoutingKey = process.env.JUDGE_SUBMISSION_ROUTING_KEY!
    await channel.bindQueue(
      submissionQueueName,
      exchangeName,
      submissionRoutingKey
    )

    const checkExchangeName = process.env.CHECK_EXCHANGE_NAME!
    await channel.assertExchange(checkExchangeName, 'direct', { durable: true })

    const checkResultQueueName = process.env.CHECK_RESULT_QUEUE_NAME!
    await channel.assertQueue(checkResultQueueName, { durable: true })

    const checkRequestQueueName = process.env.CHECK_QUEUE_NAME!
    await channel.assertQueue(checkRequestQueueName, {
      durable: true,
      arguments: { 'x-max-priority': 1 }
    })

    const checkResultRoutingKey = process.env.CHECK_RESULT_ROUTING_KEY!
    await channel.bindQueue(
      checkResultQueueName,
      checkExchangeName,
      checkResultRoutingKey
    )

    const checkRequestRoutingKey = process.env.CHECK_ROUTING_KEY!
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
