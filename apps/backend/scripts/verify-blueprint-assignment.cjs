// Uses a disposable schema in TEST_DATABASE_URL; never resets the test or dev database.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')
const { randomUUID } = require('crypto')
const { Client } = require('pg')
const dotenv = require('dotenv')

const main = async () => {
  const local = fs.existsSync('.env')
    ? dotenv.parse(fs.readFileSync('.env'))
    : {}
  const testUrl = process.env.TEST_DATABASE_URL || local.TEST_DATABASE_URL
  if (!testUrl || testUrl === (process.env.DATABASE_URL || local.DATABASE_URL))
    throw new Error('A separate TEST_DATABASE_URL is required')
  const schema = 'blueprint_test_' + randomUUID().replaceAll('-', '')
  const url = new URL(testUrl)
  url.searchParams.set('schema', schema)
  const env = {
    ...process.env,
    DATABASE_URL: url.toString(),
    BLUEPRINT_TEST_DATABASE_URL: url.toString()
  }
  const client = new Client({ connectionString: testUrl })
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'codedang-blueprint-')
  )
  await client.connect()
  try {
    await client.query(`CREATE SCHEMA "${schema}"`)
    const parent = spawnSync(
      'git',
      [
        'show',
        '79729fd27d522674f481bb4c548153cb6c3f9b7f:apps/backend/prisma/schema.prisma'
      ],
      { encoding: 'utf8' }
    )
    if (parent.status) throw new Error('Cannot read parent Prisma schema')
    const parentPath = path.join(directory, 'schema.prisma')
    fs.writeFileSync(parentPath, parent.stdout)
    const push = spawnSync(
      'pnpm',
      [
        'exec',
        'prisma',
        'db',
        'push',
        '--skip-generate',
        '--schema',
        parentPath
      ],
      { env, stdio: 'inherit' }
    )
    if (push.status) throw new Error('Parent schema setup failed')
    const migration = fs
      .readFileSync(
        'prisma/migrations/20261118010000_blueprint_assignment_save/migration.sql',
        'utf8'
      )
      .replaceAll('"public".', `"${schema}".`)
    await client.query(`SET search_path TO "${schema}"`)
    await client.query(migration)
    const all = process.argv.includes('--all')
    if (all) {
      const seed = spawnSync(
        'pnpm',
        ['exec', 'node', '-r', '@swc-node/register', 'prisma/seed.ts'],
        { env, stdio: 'inherit' }
      )
      if (seed.status !== 0) throw new Error('Disposable schema seeding failed')
    }
    const run = spawnSync(
      'pnpm',
      [
        'exec',
        'mocha',
        all
          ? '*/**/*.spec.ts'
          : 'apps/admin/src/blueprint-assignment/blueprint-assignment.integration.spec.ts',
        '--timeout',
        '30000'
      ],
      { env, stdio: 'inherit' }
    )
    process.exitCode = run.status ?? 1
  } finally {
    await client.query(`DROP SCHEMA "${schema}" CASCADE`)
    await client.end()
    fs.rmSync(directory, { recursive: true })
  }
}
main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
