import { Test, TestingModule } from '@nestjs/testing'
import { NoticeController } from './notice.controller'

describe('NoticeController', () => {
  let controller: NoticeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeController],
      providers: [{ provide: 'notice', useValue: {} }]
    }).compile()

    controller = module.get<NoticeController>(NoticeController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
