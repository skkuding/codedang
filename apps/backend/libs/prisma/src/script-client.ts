import { Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { createPrismaPool, observePoolErrors } from './prisma-pool'

export const createScriptPrismaClient = () => {
  expand(config())
  // Standalone scripts delegate pool disposal to the adapter.
  const { pool, adapter } = createPrismaPool(
    process.env.DATABASE_URL,
    process.env.DATABASE_CONNECTION_LIMIT,
    true
  )
  const logger = new Logger('PrismaScript')
  observePoolErrors(pool, logger)
  return new PrismaClient({ adapter })
}

export const runPrismaScript = async (
  client: Pick<PrismaClient, '$disconnect'>,
  main: () => Promise<unknown>
): Promise<void> => {
  try {
    await main()
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  } finally {
    await client.$disconnect()
  }
}
