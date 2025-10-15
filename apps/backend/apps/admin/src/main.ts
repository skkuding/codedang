import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs'
import Instrumentation from '@libs/instrumentation'

/**
  TODO: 가능하면 `admin.module.ts`에서 PrismaModule 처럼 IoC 리팩터링 필요
  지금은 Instrumentation.start가 AdminModule 보다 먼저 실행되어야 함
  자세한 이유는 [이 comment](https://github.com/skkuding/codedang/pull/2705#discussion_r2072945663)를 참고해주세요.
*/
const bootstrap = async () => {
  const isInstrumentationDisabled =
    process.env.DISABLE_INSTRUMENTATION === 'true'
  if (!isInstrumentationDisabled) {
    const otlpEndpointUrl =
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT_URL || 'localhost:4317'
    const resource = await Instrumentation.getResource('ADMIN-API', '2.2.0')
    await Instrumentation.start(otlpEndpointUrl, resource)
  }

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

  // default body parser limit: 100KB. Increase the limit to 100MB ()
  app.useBodyParser('json', { limit: '100mb' })
  app.use(graphqlUploadExpress({ maxFileSize: 100 * 1024 * 1024, maxFiles: 2 }))
  const { Logger, LoggerErrorInterceptor } = await import('nestjs-pino')
  app.useLogger(app.get(Logger))
  app.useGlobalInterceptors(new LoggerErrorInterceptor())
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000)
}

bootstrap()
