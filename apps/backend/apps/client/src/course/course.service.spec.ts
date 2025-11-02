import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaService } from '@libs/prisma'
import { CourseService } from './course.service'

const prismaServiceMock = {
  courseQnA: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (dto) => ({
      id: 1,
      title: dto.data.title,
      content: dto.data.content,
      createdById: dto.data.createdBy.connect.id,
      courseId: dto.data.course.connect.id,
      problemId: dto.data.problem?.connect?.id || null,
      category: dto.data.category,
      isPrivate: dto.data.isPrivate,
      createTime: new Date(),
      updateTime: new Date()
    }),
    update: async () => ({ id: 1 }),
    delete: async () => ({ id: 1 }),
    count: async () => 0
  },
  courseQnAComment: {
    create: async () => ({ id: 1 }),
    delete: async () => ({ id: 1 })
  },
  course: {
    findUnique: async () => null
  },
  problem: {
    findUnique: async () => null
  },
  userGroup: {
    findFirst: async () => null
  },
  $transaction: async (callback) => callback(prismaServiceMock)
}

describe('CourseService', () => {
  let service: CourseService
  // 2. 'prisma' 변수 선언 제거 (아직 사용되지 않음)
  // let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: PrismaService, useValue: prismaServiceMock }
      ]
    }).compile()

    service = module.get<CourseService>(CourseService)
    // 3. 'prisma' 변수 할당 제거
    // prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  // 여기에 테스트 케이스를 추가합니다.
  describe('getCourseQnAs', () => {
    it('should return paginated course QnAs', async () => {
      // TODO: 테스트 케이스 작성
      // 예: prisma.courseQnA.findMany.mockResolvedValue(...)
      // const result = await service.getCourseQnAs(...)
      // expect(result).toEqual(...)
    })
  })

  describe('createCourseQnA', () => {
    it('should create a new course QnA', async () => {
      // TODO: 테스트 케이스 작성
    })
  })

  // ... (updateCourseQnA, deleteCourseQnA, createCourseQnAComment 등)
})
