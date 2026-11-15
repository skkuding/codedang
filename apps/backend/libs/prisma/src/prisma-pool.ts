import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

export const createPrismaPool = (
  connectionString: string | undefined,
  connectionLimit?: string,
  disposeExternalPool = false
) => {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required')
  }
  const max = Number(connectionLimit ?? '10')
  if (!Number.isSafeInteger(max) || max <= 0) {
    throw new Error('DATABASE_CONNECTION_LIMIT must be a positive safe integer')
  }

  const url = new URL(connectionString)
  const schema = url.searchParams.get('schema') ?? 'public'
  // Prisma-specific parameters do not configure node-postgres.
  url.searchParams.delete('schema')
  url.searchParams.delete('connection_limit')
  const pool = new Pool({
    connectionString: url.toString(),
    max,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 300_000
  })

  return {
    pool,
    max,
    adapter: new PrismaPg(pool, { schema, disposeExternalPool })
  }
}

export const observePoolErrors = (
  pool: Pool,
  logger: { error: (message: string, stack?: string) => void }
): (() => void) => {
  const handleError = (error: Error) =>
    logger.error('PostgreSQL pool error', error.stack)
  pool.on('error', handleError)
  return () => pool.removeListener('error', handleError)
}
