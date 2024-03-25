import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import { GroupResolver } from './group.resolver'
import { GroupService } from './group.service'

describe('GroupResolver', () => {
  let resolver: GroupResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupResolver,
        { provide: GroupService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    resolver = module.get<GroupResolver>(GroupResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
