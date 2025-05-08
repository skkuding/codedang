import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import Instrumentation from '@libs/instrumentation'

const bootstrap = async () => {
  if (
    process.env.APP_ENV === 'production' ||
    process.env.APP_ENV === 'stage' ||
    process.env.ENABLE_OPENTELEMETRY === 'true'
  ) {
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
