import { Test, type TestingModule } from '@nestjs/testing'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  DuplicateFoundException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { exampleProblemTags, exampleTag } from '../mock/mock'
import { TagService } from './tag.service'

const db = {
  tag: {
    create: stub(),
    findUnique: stub(),
    findFirst: stub(),
    delete: stub(),
    findMany: stub()
  },
  problemTag: {
    findMany: stub()
  },
  problemTestcase: {
    findMany: stub()
  }
}

describe('TagService', () => {
  let service: TagService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagService, { provide: PrismaService, useValue: db }]
    }).compile()
    service = module.get<TagService>(TagService)
  })

  describe('createTag', () => {
    it('should return a created tag', async () => {
      beforeEach(() => {
        db.tag.create.resetBehavior()
      })
      db.tag.create.resolves(exampleTag)
      const result = await service.createTag('Brute Force')
      expect(result).to.deep.equal(exampleTag)
    })

    it('should handle a duplicate exception', async () => {
      beforeEach(() => {
        db.tag.create.resetBehavior()
      })
      db.tag.create.rejects(
        new PrismaClientKnownRequestError('message', {
          code: 'P2002',
          clientVersion: '5.11.0'
        })
      )
      await expect(service.createTag('something duplicate')).to.be.rejectedWith(
        DuplicateFoundException
      )
    })
  })

  describe('deleteTag', () => {
    beforeEach(() => {
      db.tag.findFirst.reset()
      db.tag.delete.reset()
    })
    afterEach(() => {
      db.tag.findFirst.reset()
      db.tag.delete.reset()
    })

    it('should return deleted tag', async () => {
      db.tag.findFirst.resolves(exampleTag)
      db.tag.delete.resolves(exampleTag)
      const result = await service.deleteTag('Brute Force')
      expect(result).to.deep.equal(exampleTag)
    })

    it('should handle a entity not exist exception', async () => {
      db.tag.findFirst.resolves(null)
      await expect(
        service.deleteTag('something does not exist')
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
  describe('getTag', () => {
    afterEach(() => {
      db.tag.findUnique.reset()
    })

    it('should return a tag object', async () => {
      db.tag.findUnique.resolves(exampleTag)
      expect(await service.getTag(1)).to.deep.equal(exampleTag)
    })

    it('should throw an EntityNotExist exception when tagId do not exist', async () => {
      await expect(service.getTag(999)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('getProblemTags', () => {
    afterEach(() => {
      db.problemTestcase.findMany.reset()
    })

    it('should return a problem tag array', async () => {
      db.problemTag.findMany.resolves(exampleProblemTags)
      expect(await service.getProblemTags(1)).to.deep.equal(exampleProblemTags)
    })
  })
})
