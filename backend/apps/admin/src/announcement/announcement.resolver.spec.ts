import { Test, TestingModule } from '@nestjs/testing'
import { AnnouncementResolver } from './announcement.resolver'
import { AnnouncementService } from './announcement.service'

describe('AnnouncementResolver', () => {
  let resolver: AnnouncementResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnouncementResolver, AnnouncementService]
    }).compile()

    resolver = module.get<AnnouncementResolver>(AnnouncementResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
