// Local-only fixture setup. Run from apps/backend; no migrations or global resets.
const { resolve } = require('node:path')
const { release, networkInterfaces } = require('node:os')
const { mkdirSync, writeFileSync, chmodSync } = require('node:fs')
const { PrismaClient, Prisma } = require('@prisma/client')
const { hash } = require('argon2')

const backend = resolve(__dirname, '..')
try {
  process.loadEnvFile(resolve(backend, '.env'))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}
const mode = process.argv[2] || 'setup'
const password = process.env.COLLAB_TEST_PASSWORD || 'CollabLocal123!'
const marker = 'local-collaborator-fixture-v1'
const labels = [
  'owner',
  'editor',
  'reviewer',
  'pending',
  'rejected',
  'outsider'
]
const baseUrl = process.env.COLLAB_CLIENT_URL || 'http://127.0.0.1:4000'
const gqlUrl = process.env.COLLAB_GQL_URL || 'http://127.0.0.1:3000/graphql'
const output = resolve(
  backend,
  '../../collection/admin/collaborator.generated.js'
)

function localUrl(value, protocols) {
  const url = new URL(value)
  if (
    !protocols.includes(url.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  ) {
    throw new Error('Only loopback development URLs are allowed.')
  }
  return url
}

async function main() {
  if (!['setup', 'login'].includes(mode)) throw new Error('Use setup or login.')
  if (process.env.NODE_ENV === 'production')
    throw new Error('Production is not allowed.')
  localUrl(process.env.DATABASE_URL, ['postgres:', 'postgresql:'])
  localUrl(baseUrl, ['http:'])
  localUrl(gqlUrl, ['http:'])
  const fields = Prisma.dmmf.datamodel.models.find(
    (m) => m.name === 'MandeuldangCollaborator'
  ).fields
  if (
    !['invitedById', 'invitedAt', 'approvedAt'].every((name) =>
      fields.some((f) => f.name === name)
    )
  ) {
    throw new Error(
      'Prisma Client is missing collaboration fields. Generate it on the collaboration branch first.'
    )
  }
  const db = new PrismaClient()
  try {
    let users
    let problem
    if (mode === 'setup') {
      const encrypted = await hash(password)
      ;({ users, problem } = await db.$transaction(
        async (tx) => {
          // Serialise repeated setup runs without introducing a fixture table.
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(35222026)`
          const users = {}
          for (const label of labels) {
            const username = `collab_${label}`
            const email = `${username}@collab-test.invalid`
            const existing = await tx.user.findUnique({ where: { username } })
            if (
              existing &&
              (existing.email !== email || existing.role !== 'User')
            ) {
              throw new Error(`Fixture account collision: ${username}`)
            }
            users[label] = await tx.user.upsert({
              where: { username },
              create: { username, email, password: encrypted, role: 'User' },
              update: { password: encrypted }
            })
          }
          const matches = await tx.problem.findMany({
            where: { source: marker }
          })
          if (matches.length > 1)
            throw new Error(
              'Multiple fixture problems found; inspect manually.'
            )
          let problem = matches[0]
          if (
            problem &&
            (problem.createdById !== users.owner.id ||
              problem.creationMode !== 'Mandeuldang')
          ) {
            throw new Error(
              'Fixture problem ownership or creation mode changed; inspect manually.'
            )
          }
          const data = {
            title: '[Local collaboration test] Problem A',
            source: marker,
            creationMode: 'Mandeuldang',
            status: 'Draft',
            problemType: 'General',
            createdById: users.owner.id,
            visibleLockTime: new Date('9999-12-31T23:59:59.999Z')
          }
          problem = problem
            ? await tx.problem.update({ where: { id: problem.id }, data })
            : await tx.problem.create({ data })
          // Only this dedicated fixture problem's participation state is reset.
          await tx.mandeuldangCollaborator.deleteMany({
            where: { problemId: problem.id }
          })
          const now = new Date()
          for (const label of labels.filter((x) => x !== 'outsider')) {
            const status =
              label === 'pending'
                ? 'Pending'
                : label === 'rejected'
                  ? 'Rejected'
                  : 'Approved'
            const role =
              label === 'owner'
                ? 'Owner'
                : ['editor', 'pending'].includes(label)
                  ? 'Editor'
                  : 'Reviewer'
            await tx.mandeuldangCollaborator.create({
              data: {
                problemId: problem.id,
                userId: users[label].id,
                role,
                status,
                invitedById: label === 'owner' ? null : users.owner.id,
                invitedAt: label === 'owner' ? null : now,
                approvedAt: status === 'Approved' ? now : null
              }
            })
          }
          return { users, problem }
        },
        { timeout: 30000 }
      ))
      console.log(
        `Fixture ready: problem ${problem.id}; 6 accounts, 5 participants.`
      )
    } else {
      users = {}
      for (const label of labels) {
        users[label] = await db.user.findUnique({
          where: { username: `collab_${label}` }
        })
        if (
          !users[label] ||
          users[label].email !== `collab_${label}@collab-test.invalid` ||
          users[label].role !== 'User'
        ) {
          throw new Error(
            'Fixture accounts missing or changed. Run setup first.'
          )
        }
      }
      const matches = await db.problem.findMany({
        where: {
          source: marker,
          createdById: users.owner.id,
          creationMode: 'Mandeuldang'
        }
      })
      if (matches.length !== 1)
        throw new Error(
          'Fixture problem missing or ambiguous. Run setup first.'
        )
      problem = matches[0]
    }

    // Windows Bruno may not reach WSL through localhost forwarding.
    const brunoGqlUrl = new URL(gqlUrl)
    if (!process.env.COLLAB_GQL_URL && /microsoft/i.test(release())) {
      const address = networkInterfaces().eth0?.find(
        (entry) => entry.family === 'IPv4' && !entry.internal
      )
      if (address) brunoGqlUrl.hostname = address.address
    }
    const vars = { baseUrl, gqlUrl: brunoGqlUrl.href, collabProblemId: problem.id }
    for (const label of labels) {
      vars[`${label}UserId`] = users[label].id
      vars[`${label}Username`] = users[label].username
      vars[`${label}Email`] = users[label].email
    }
    const tokens = {}
    for (const label of labels) {
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/auth/login`, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(10000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: users[label].username, password })
      })
      const authorization = res.headers.get('authorization')
      if (!res.ok || !authorization?.startsWith('Bearer ')) {
        throw new Error(
          `Login failed for ${label} (HTTP ${res.status}); start client API and rerun login.`
        )
      }
      tokens[`${label}Token`] = authorization.slice(7)
    }
    mkdirSync(resolve(output, '..'), { recursive: true })
    writeFileSync(output, 'module.exports = ' + JSON.stringify({ ...vars, ...tokens }, null, 2) + '\n', { mode: 0o600 })
    chmodSync(output, 0o600)
    console.log(
      'Login complete for all 6 accounts. Tokens saved to ignored collaborator.generated.js (not printed).'
    )
    console.log(
      'Open Codedang Admin > Mandeuldang Collaborator; choose Local.'
    )
    console.table(
      labels.map((label) => ({
        account: users[label].username,
        userId: users[label].id
      }))
    )
  } finally {
    await db.$disconnect()
  }
}
main().catch((error) => {
  // Avoid connection strings, SQL and tokens in error output.
  console.error(
    error.name === 'PrismaClientInitializationError' ||
      error.name.startsWith('Prisma')
      ? `Database setup failed (${error.code || error.name}). Check local DB and collaboration migrations; no reset is performed.`
      : error.message
  )
  process.exitCode = 1
})
