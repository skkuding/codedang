import { NestFactory } from '@nestjs/core'
import { AdminModule } from './admin.module'

const bootstrap = async () => {
  const app = await NestFactory.create(AdminModule)
  await app.listen(3000)
}

bootstrap()
