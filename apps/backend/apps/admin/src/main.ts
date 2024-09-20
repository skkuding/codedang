import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { graphqlUploadExpress } from 'graphql-upload'
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino'
import { AdminModule } from './admin.module'
import startMetricsExporter from './metric'
import tracer from './tracer'

const bootstrap = async () => {
  // otel instrumentation
  if (process.env.APP_ENV == 'production' || process.env.APP_ENV == 'stage') {
    if (
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT_URL == undefined ||
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT_URL == ''
    ) {
      console.log('The exporter url is not defined')
    } else {
      tracer.init()
      startMetricsExporter()
    }
  }

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
  app.useLogger(app.get(Logger))
  app.useGlobalInterceptors(new LoggerErrorInterceptor())
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000)
}

bootstrap()
