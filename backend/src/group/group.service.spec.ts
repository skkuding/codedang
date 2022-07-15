import { Test, TestingModule } from '@nestjs/testing'
import { UserGroup } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { GroupService } from './group.service'

const userId = 1
const groupId = 1

const mockPrismaService = {
  userGroup: {
    findFirst: jest.fn()
  }
}

describe('GroupService', () => {
  let service: GroupService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()

    service = module.get<GroupService>(GroupService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('isUserGroupMember', () => {
    let userGroup: Partial<UserGroup>

    it('should return true when given user is registered in the group', async () => {
      // given
      userGroup = { is_registered: true }
      mockPrismaService.userGroup.findFirst.mockResolvedValue(userGroup)

      // when
      const result = await service.isUserGroupMember(userId, groupId)

      // then
      expect(result).toBeTruthy()
    })

    it('should return false when userGroup record does not exist', async () => {
      // given
      mockPrismaService.userGroup.findFirst.mockResolvedValue(null)

      // when
      const result = await service.isUserGroupMember(userId, groupId)

      // then
      expect(result).toBeFalsy()
    })

    it('should return false when given user is not registered yet', async () => {
      // given
      userGroup = { is_registered: false }
      mockPrismaService.userGroup.findFirst.mockResolvedValue(userGroup)

      // when
      const result = await service.isUserGroupMember(userId, groupId)

      // then
      expect(result).toBeFalsy()
    })
  })

  describe('isUserGroupManager', () => {
    let userGroup: Partial<UserGroup>

    it('should return true when given user is registered in the group', async () => {
      // given
      userGroup = { is_registered: true, is_group_manager: true }
      mockPrismaService.userGroup.findFirst.mockResolvedValue(userGroup)

      // when
      const result = await service.isUserGroupManager(userId, groupId)

      // then
      expect(result).toBeTruthy()
    })

    it('should return false when userGroup record does not exist', async () => {
      // given
      mockPrismaService.userGroup.findFirst.mockResolvedValue(null)

      // when
      const result = await service.isUserGroupManager(userId, groupId)

      // then
      expect(result).toBeFalsy()
    })

    it('should return false when given user is not registered ', async () => {
      // given
      userGroup = { is_registered: false, is_group_manager: true }
      mockPrismaService.userGroup.findFirst.mockResolvedValue(userGroup)

      // when
      const result = await service.isUserGroupManager(userId, groupId)

      // then
      expect(result).toBeFalsy()
    })

    it('should return false when given user is not group manager ', async () => {
      // given
      userGroup = { is_registered: true, is_group_manager: false }
      mockPrismaService.userGroup.findFirst.mockResolvedValue(userGroup)

      // when
      const result = await service.isUserGroupManager(userId, groupId)

      // then
      expect(result).toBeFalsy()
    })
  })
})
