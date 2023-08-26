import { NestFactory } from '@nestjs/core'
import { graphqlUploadExpress } from 'graphql-upload'
import { AdminModule } from './admin.module'

const bootstrap = async () => {
  const app = await NestFactory.create(AdminModule)
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 2 }))
  // app.enableCors({
  //   allowedHeaders: ['*'],
  //   exposedHeaders: ['authorization'],
  //   credentials: true
  // })
  await app.listen(3000)
}

bootstrap()
