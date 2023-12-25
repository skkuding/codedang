import { Test, TestingModule } from '@nestjs/testing'
import {
  type Contest,
  type Group,
  type Problem,
  Language,
  Level
} from '@prisma/client'
import { expect } from 'chai'
import dayjs from 'dayjs'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { AnnouncementService } from './announcement.service'

// faker.js 적용

const contestId = 1
const userId = 1
const groupId = 1

const contest = {
  id: contestId,
  createdById: userId,
  groupId: groupId,
  title: 'title',
  description: 'description',
  startTime: dayjs().add(-1, 'day').toDate(),
  endTime: dayjs().add(1, 'day').toDate(),
  config: {
    isVisible: true,
    isRankVisible: true
  },
  createTime: dayjs().add(-1, 'day').toDate(),
  updateTime: dayjs().add(-1, 'day').toDate(),
  group: {
    id: groupId,
    groupName: 'group'
  }
} satisfies Contest & { group: Partial<Group> }

export const problems: Problem[] = [
  {
    id: 1,
    createdById: 1,
    groupId: 1,
    title: 'public problem',
    description: '',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    languages: [Language.C],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level1,
    source: '',
    exposeTime: undefined,
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: [],
    template: []
  },
  {
    id: 2,
    createdById: 1,
    groupId: 1,
    title: 'problem',
    description: '',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: '',
    exposeTime: undefined,
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: [],
    template: []
  }
]

const contests: Partial<Contest>[] = [contest]
const userContests: Partial<Contest>[] = [contest]

const user = {
  id: userId,
  contest: userContests
}

const mockPrismaService = {
  contest: {
    findUnique: stub().resolves(contest),
    findUniqueOrThrow: stub().resolves(contest),
    findFirst: stub().resolves(contest),
    findFirstOrThrow: stub().resolves(contest),
    findMany: stub().resolves(contests)
  },
  user: {
    findUnique: stub().resolves(user)
  }
}

describe('AnnouncementService', () => {
  let service: AnnouncementService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<AnnouncementService>(AnnouncementService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
