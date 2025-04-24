import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs'
import Instrumentation from '@libs/instrumentation'

const bootstrap = async () => {
  const resource = await Instrumentation.getResource('ADMIN-API', '2.2.0')
  await Instrumentation.start(
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT_URL || 'localhost:4317',
    resource
  )

  const { AdminModule } = await import('./admin.module')
  const app = await NestFactory.create<NestExpressApplication>(AdminModule, {
    bufferLogs: true
  })

  if (process.env.APP_ENV !== 'production' && process.env.APP_ENV !== 'stage') {
    app.enableCors({
      origin: 'http://localhost:5525',
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: ['*'],
      exposedHeaders: ['Content-Type', 'Authorization', 'Email-Auth']
    })
  }

  // default body parser limit: 100KB. Increase the limit to 10MB ()
  app.useBodyParser('json', { limit: '10mb' })
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 2 }))
  const { Logger, LoggerErrorInterceptor } = await import('nestjs-pino')
  app.useLogger(app.get(Logger))
  app.useGlobalInterceptors(new LoggerErrorInterceptor())
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000)
}

bootstrap()
