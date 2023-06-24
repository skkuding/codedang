import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { GroupResolver } from './group.resolver'

describe('GroupResolver', () => {
  let resolver: GroupResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupResolver]
    }).compile()

    resolver = module.get<GroupResolver>(GroupResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
