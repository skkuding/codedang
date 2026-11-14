import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { defineConfig } from 'prisma/config'

expand(config())

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'swc-node prisma/seed.ts'
  },
  datasource: {
    // Generation does not require a database URL; database commands validate it.
    url: process.env.DATABASE_URL ?? '',
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL
  }
})
