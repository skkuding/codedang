import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { AnnouncementResolver } from './announcement.resolver'
import { AnnouncementService } from './announcement.service'

describe('AnnouncementResolver', () => {
  let resolver: AnnouncementResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementResolver,
        { provide: AnnouncementService, useValue: {} }
      ]
    }).compile()

    resolver = module.get<AnnouncementResolver>(AnnouncementResolver)
  })

  it('shoulld be defined', () => {
    expect(resolver).to.be.ok
  })
})
