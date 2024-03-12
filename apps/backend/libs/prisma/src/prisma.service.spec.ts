import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaService } from './prisma.service'

describe('PrismaService', () => {
  let service: PrismaService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService, ConfigService]
    }).compile()

    service = module.get(PrismaService)
  })

  it('should be defined', () => {
    expect(service).to.be.not.undefined
  })
})
