import { Test, TestingModule } from '@nestjs/testing'
import { CheckService } from './check.service'

describe('CheckService', () => {
  let service: CheckService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckService]
    }).compile()

    service = module.get<CheckService>(CheckService)
  })

  /*it('should be defined', () => {
    expect(service).toBeDefined();
  });*/
})
