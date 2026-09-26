import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { HttpStatus } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import type { Response } from 'express'
import { stub, type SinonStub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

describe('AdminController', () => {
  let adminController: AdminController
  let queryDatabase: SinonStub
  let queryCache: SinonStub
  let aggregateCacheGet: SinonStub
  let response: Response

  beforeEach(async () => {
    queryDatabase = stub().resolves([{ value: 1 }])
    queryCache = stub().resolves(undefined)
    aggregateCacheGet = stub().resolves(undefined)
    response = {
      status: stub()
    } as unknown as Response

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: { $queryRaw: queryDatabase }
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: aggregateCacheGet,
            stores: [{ get: queryCache }]
          }
        }
      ]
    }).compile()

    adminController = app.get<AdminController>(AdminController)
  })

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(adminController.getHello()).to.equal('Hello World!')
    })
  })

  describe('readiness', () => {
    it('should report ready when dependencies are available', async () => {
      expect(await adminController.getReadiness(response)).to.deep.equal({
        status: 'ok'
      })
    })

    it('should report unavailable when a dependency is unavailable', async () => {
      queryDatabase.rejects(new Error('Database unavailable'))

      expect(await adminController.getReadiness(response)).to.deep.equal({
        status: 'unavailable'
      })
      expect(
        (response.status as SinonStub).calledWith(
          HttpStatus.SERVICE_UNAVAILABLE
        )
      ).to.be.true
    })

    it('should report unavailable when Redis is unavailable', async () => {
      queryCache.rejects(new Error('Redis unavailable'))

      expect(await adminController.getReadiness(response)).to.deep.equal({
        status: 'unavailable'
      })
      expect(
        (response.status as SinonStub).calledWith(
          HttpStatus.SERVICE_UNAVAILABLE
        )
      ).to.be.true
      expect(aggregateCacheGet.notCalled).to.be.true
    })
  })
})
