import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AdminModule } from './admin.module'
import { graphqlUploadExpress } from 'graphql-upload'

async function bootstrap() {
  const app = await NestFactory.create(AdminModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 2 }))
  await app.listen(3000)
}
bootstrap()
