import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import type Redis from 'ioredis'
import Instrumentation from '@libs/instrumentation'
import { REDIS_CLIENT, RedisIoAdapter } from '@libs/redis'

/**
  TODO: 가능하면 `app.module.ts`에서 PrismaModule 처럼 IoC 리팩터링 필요
  지금은 Instrumentation.start가 AppModule 보다 먼저 실행되어야 함
  자세한 이유는 [이 comment](https://github.com/skkuding/codedang/pull/2705#discussion_r2072945663)를 참고해주세요.
*/
const bootstrap = async () => {
  const isInstrumentationDisabled =
    process.env.DISABLE_INSTRUMENTATION === 'true'
  if (!isInstrumentationDisabled) {
    const otlpEndpointUrl =
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT_URL || 'localhost:4317'
    const resource = await Instrumentation.getResource('CLIENT-API', '2.2.0')
    await Instrumentation.start(otlpEndpointUrl, resource)
  }

  const { AppModule } = await import('./app.module')
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  })

  const { Logger, LoggerErrorInterceptor } = await import('nestjs-pino')
  app.useLogger(app.get(Logger))
  app.useGlobalInterceptors(new LoggerErrorInterceptor())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.use(cookieParser())

  const redisClient = app.get<Redis>(REDIS_CLIENT)
  const redisIoAdapter = new RedisIoAdapter(app, redisClient)
  await redisIoAdapter.connectToRedis()
  app.useWebSocketAdapter(redisIoAdapter)

  if (process.env.APP_ENV !== 'production' && process.env.APP_ENV !== 'stage') {
    app.enableCors({
      origin: 'http://localhost:5525',
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: ['*'],
      exposedHeaders: ['Content-Type', 'Authorization', 'Email-Auth']
    })
    const config = new DocumentBuilder()
      .setTitle('SKKU coding platform')
      .setDescription('API description')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true
      }
    })
  } else {
    app.setGlobalPrefix('api')
  }

  await app.listen(4000)
}

bootstrap()
