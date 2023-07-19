import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { graphqlUploadExpress } from 'graphql-upload'
import { AdminModule } from './admin.module'

async function bootstrap() {
  const app = await NestFactory.create(AdminModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 2 }))
  await app.listen(3000)
}
bootstrap()
