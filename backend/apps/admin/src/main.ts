import { NestFactory } from '@nestjs/core'
import { AdminModule } from './admin.module'

const bootstrap = async () => {
  const app = await NestFactory.create(AdminModule)
  app.enableCors({
    allowedHeaders: ['authorization'],
    exposedHeaders: ['authorization'],
    credentials: true
  })
  await app.listen(3000)
}

bootstrap()
