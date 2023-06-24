import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { GroupService } from './group.service'

describe('GroupService', () => {
  let service: GroupService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService]
    }).compile()

    service = module.get<GroupService>(GroupService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
