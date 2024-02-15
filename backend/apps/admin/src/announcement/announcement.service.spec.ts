import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  DuplicateFoundException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { AnnouncementService } from './announcement.service'

const problemId = faker.number.int()
const id = faker.number.int()
const announcementInput = {
  problemId,
  content: faker.string.sample()
}

const announcement = {
  ...announcementInput,
  id
}

const problem = {
  problemId
}

const db = {
  announcement: {
    findFirst: stub(),
    findFirstOrThrow: stub(),
    findMany: stub().resolves([announcement]),
    update: stub(),
    delete: stub(),
    create: stub().resolves(announcement)
  },
  problem: {
    findFirst: stub(),
    findFirstOrThrow: stub()
  }
}

const PrismaErrorInstance = new PrismaClientKnownRequestError('error', {
  code: '4xx',
  clientVersion: 'x.x.x'
})

PrismaErrorInstance.name = 'NotFoundError'

describe('AnnouncementService', () => {
  let service: AnnouncementService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnouncementService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get<AnnouncementService>(AnnouncementService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('createAnnouncement', () => {
    it('should return created announcement', async () => {
      db.announcement.findFirst.resolves(null)
      db.problem.findFirstOrThrow.resolves(problem)

      const res = await service.createAnnouncement(announcementInput)
      expect(res).to.deep.equal(announcement)
    })

    it('should throw error when given announcement already exists', async () => {
      db.announcement.findFirst.resolves(announcement)

      await expect(
        service.createAnnouncement(announcementInput)
      ).to.be.rejectedWith(DuplicateFoundException)
    })

    it('should throw error when given problemId is invalid', async () => {
      db.announcement.findFirst.resolves(null)
      db.problem.findFirstOrThrow.rejects(PrismaErrorInstance)

      await expect(
        service.createAnnouncement(announcementInput)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('getAnnouncementsByProblemId', () => {
    it('should return all announcements', async () => {
      db.announcement.findMany()
      const res = await service.getAnnouncementsByProblemId(problemId)
      expect(res).to.deep.equal([announcement])
    })
  })

  describe('getAnnouncement', () => {
    it('should throw error when given id is invalid', async () => {
      db.announcement.findFirstOrThrow.rejects(PrismaErrorInstance)
      await expect(service.getAnnouncement(id)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
    it('should return an announcement', async () => {
      db.announcement.findFirstOrThrow.resolves(announcement)
      const res = await service.getAnnouncement(id)
      expect(res).to.deep.equal(announcement)
    })
  })

  describe('updateAnnouncement', () => {
    it('should return updated announcement', async () => {
      db.announcement.update.resolves(announcement)
      const res = await service.updateAnnouncement(id, announcementInput)
      expect(res).to.deep.equal(announcement)
    })
    it('should throw error when given id is invalid', async () => {
      db.announcement.update.rejects(PrismaErrorInstance)
      await expect(
        service.updateAnnouncement(id, announcementInput)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('removeAnnouncement', () => {
    it('should return deleted announcement', async () => {
      db.announcement.delete.resolves(announcement)
      const res = await service.removeAnnouncement(id)
      expect(res).to.deep.equal(announcement)
    })
    it('should throw error when given id is invalid', async () => {
      db.announcement.delete.rejects(PrismaErrorInstance)
      await expect(service.removeAnnouncement(id)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })
})
