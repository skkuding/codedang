import { HttpModule } from '@nestjs/axios'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { ContestRole, Language, Level, ResultStatus } from '@prisma/client'
import { expect } from 'chai'
import { config } from 'dotenv'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { submissionDto } from '../mock/submission.mock'
import { SubmissionFinalizationService } from '../submission-finalization.service'
import { SubmissionPublicationService } from '../submission-pub.service'
import { SubmissionService } from '../submission.service'

// Run explicitly with mocha; each run owns and removes its isolated schema.
describe('submission records with PostgreSQL', function () {
  this.timeout(60000)
  const schema = `tas2912_${randomUUID().replaceAll('-', '')}`
  let db: PrismaService
  let module: TestingModule
  let service: SubmissionService
  let finalization: SubmissionFinalizationService
  const publish = stub().resolves()
  let sequence = 0

  before(async () => {
    config({ quiet: true })
    const testUrl = process.env.TEST_DATABASE_URL
    if (!testUrl) throw new Error('TEST_DATABASE_URL is required')
    const url = new URL(testUrl)
    if (
      !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
      url.port !== '5434'
    ) {
      throw new Error(
        'Integration tests require the local test DB on port 5434'
      )
    }
    url.searchParams.set('schema', schema)
    const databaseUrl = url.toString()
    db = new PrismaService(
      new ConfigService(Object.fromEntries([['DATABASE_URL', databaseUrl]]))
    )
    await db.$connect()
    // Historical migrations name public explicitly; db push isolates all tables.
    execFileSync('pnpm', ['exec', 'prisma', 'db', 'push', '--skip-generate'], {
      env: {
        ...process.env,
        ...Object.fromEntries([['DATABASE_URL', databaseUrl]])
      },
      stdio: 'pipe'
    })
    module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        SubmissionService,
        SubmissionFinalizationService,
        ConfigService,
        { provide: PrismaService, useValue: db },
        {
          provide: SubmissionPublicationService,
          useValue: { publishJudgeRequestMessage: publish }
        },
        { provide: CACHE_MANAGER, useValue: {} }
      ]
    }).compile()
    service = module.get(SubmissionService)
    finalization = module.get(SubmissionFinalizationService)
  })

  after(async () => {
    if (db) {
      try {
        await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
      } finally {
        await db.$disconnect()
      }
    }
    await module?.close()
  })

  beforeEach(() => publish.resetHistory())

  const fixture = async (
    kind: 'assignment' | 'contest',
    hasTestcase = true
  ) => {
    const name = `${schema}_${++sequence}`
    const user = await db.user.create({
      data: {
        username: name,
        email: `${name}@example.test`,
        password: 'unused'
      }
    })
    const problem = await db.problem.create({
      data: {
        title: name,
        description: '',
        inputDescription: '',
        outputDescription: '',
        hint: '',
        languages: [Language.C],
        timeLimit: 1000,
        memoryLimit: 128,
        difficulty: Level.Level1,
        source: '',
        visibleLockTime: new Date(0),
        ...(hasTestcase && {
          problemTestcase: { create: { input: '', output: '', isHidden: true } }
        })
      }
    })
    const startTime = new Date(Date.now() - 60000)
    const endTime = new Date(Date.now() + 3600000)
    let id: number
    if (kind === 'assignment') {
      const group = await db.group.create({
        data: {
          groupName: name,
          config: {},
          userGroup: { create: { userId: user.id } }
        }
      })
      const assignment = await db.assignment.create({
        data: {
          title: name,
          description: '',
          groupId: group.id,
          startTime,
          endTime,
          assignmentProblem: {
            create: { problemId: problem.id, order: 0, score: 100 }
          }
        }
      })
      id = assignment.id
    } else {
      const contest = await db.contest.create({
        data: {
          title: name,
          startTime,
          endTime,
          userContest: {
            create: { userId: user.id, role: ContestRole.Participant }
          },
          contestProblem: {
            create: { problemId: problem.id, order: 0, score: 100 }
          }
        }
      })
      id = contest.id
    }
    const options = {
      submissionDto,
      problemId: problem.id,
      userId: user.id,
      userIp: '127.0.0.1'
    }
    const submit = () =>
      kind === 'assignment'
        ? service.submitToAssignment({ ...options, assignmentId: id })
        : service.submitToContest({ ...options, contestId: id })
    const record = () =>
      kind === 'assignment'
        ? db.assignmentRecord.findFirst({ where: { assignmentId: id } })
        : db.contestRecord.findFirst({ where: { contestId: id } })
    return { id, user, problem, submit, record }
  }

  for (const kind of ['assignment', 'contest'] as const) {
    it(`rolls back ${kind} records when submission insertion fails`, async () => {
      const f = await fixture(kind)
      await db.$executeRawUnsafe(
        `ALTER TABLE "${schema}"."submission" ADD CONSTRAINT "reject_${kind}" CHECK ("problem_id" <> ${f.problem.id})`
      )
      try {
        await expect(f.submit()).to.be.rejected
        expect(await f.record()).to.equal(null)
        expect(
          await db.assignmentProblemRecord.count({
            where: { problemId: f.problem.id }
          })
        ).to.equal(0)
        expect(
          await db.submission.count({ where: { problemId: f.problem.id } })
        ).to.equal(0)
        expect(publish.called).to.equal(false)
      } finally {
        await db.$executeRawUnsafe(
          `ALTER TABLE "${schema}"."submission" DROP CONSTRAINT "reject_${kind}"`
        )
      }
    })

    it(`persists simultaneous ${kind} submissions without duplicate records`, async () => {
      const f = await fixture(kind)
      const submissions = await Promise.all([f.submit(), f.submit()])
      expect(submissions[0].id).not.to.equal(submissions[1].id)
      expect(await f.record()).not.to.equal(null)
      expect(
        await db.submission.count({ where: { problemId: f.problem.id } })
      ).to.equal(2)
      if (kind === 'assignment') {
        expect(
          await db.assignmentProblemRecord.count({
            where: { assignmentId: f.id }
          })
        ).to.equal(1)
      }
      expect(publish.callCount).to.equal(2)
    })

    for (const hasTestcase of [true, false]) {
      it(`finalizes ${kind} without prior records using ${hasTestcase ? 'judge results' : 'immediate acceptance'}`, async () => {
        const f = await fixture(kind, hasTestcase)
        expect(await f.record()).to.equal(null)
        const submission = await f.submit()
        if (hasTestcase) {
          expect(submission.result).to.equal(ResultStatus.Judging)
          await finalization.finalizeSubmission(
            submission,
            ResultStatus.Accepted,
            100
          )
        }
        const saved = await db.submission.findUniqueOrThrow({
          where: { id: submission.id }
        })
        expect(saved.result).to.equal(ResultStatus.Accepted)
        expect(saved.score?.toNumber()).to.equal(100)
        const record = await f.record()
        expect(Number(record?.score)).to.equal(100)
        if (kind === 'assignment') {
          expect(record?.acceptedProblemNum).to.equal(1)
          const problemRecord =
            await db.assignmentProblemRecord.findFirstOrThrow({
              where: { assignmentId: f.id }
            })
          expect(problemRecord.isSubmitted).to.equal(true)
          expect(problemRecord.isAccepted).to.equal(true)
          expect(problemRecord.score.toNumber()).to.equal(100)
        }
      })
    }
  }

  for (const role of [
    ContestRole.Admin,
    ContestRole.Manager,
    ContestRole.Reviewer
  ]) {
    for (const hasTestcase of [true, false]) {
      it(`keeps ${role} out of ranking records with testcases=${hasTestcase}`, async () => {
        const f = await fixture('contest', hasTestcase)
        await db.userContest.updateMany({
          where: { contestId: f.id, userId: f.user.id },
          data: { role }
        })
        const submission = await f.submit()
        if (hasTestcase) {
          await finalization.finalizeSubmission(
            submission,
            ResultStatus.Accepted,
            100
          )
        }
        expect(await f.record()).to.equal(null)
        expect(
          await db.contestProblemRecord.count({
            where: { contestProblem: { contestId: f.id } }
          })
        ).to.equal(0)
      })
    }
  }
})
