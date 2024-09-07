import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino'
import { AppModule } from './app.module'
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

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  })

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
