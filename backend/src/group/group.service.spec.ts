import { Test, TestingModule } from '@nestjs/testing'
import { Group, UserGroup } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { RequestGroupDto } from './dto/request-group.dto'
import { CreateMemberDto } from './dto/create-member.dto'
import { GroupService } from './group.service'
import { Membership } from './interface/membership.interface'
import {
  ActionNotAllowedException,
  EntityNotExistException
} from 'src/common/exception/business.exception'
import { randomBytes } from 'crypto'

const userId = 1
const groupId = 2
const membershipId = 1

const group: Group = {
  id: groupId,
  created_by_id: userId,
  group_name: 'group_name',
  private: true,
  invitation_code: randomBytes(6).toString('base64').padStart(8, 'A'),
  description: 'description',
  create_time: new Date(),
  update_time: new Date()
}

const userGroup: UserGroup = {
  id: membershipId,
  user_id: userId,
  group_id: groupId,
  is_registered: true,
  is_group_manager: true,
  create_time: new Date(),
  update_time: new Date()
}

const membership: Membership = {
  id: userGroup.id,
  user: {
    username: 'example',
    student_id: '2020710000',
    email: 'example@skku.edu',
    UserProfile: {
      real_name: 'Hong Gildong'
    }
  }
}

const requestGroupDto: RequestGroupDto = {
  group_name: group.group_name,
  private: group.private,
  description: group.description
}

const createMemberDto: CreateMemberDto = {
  student_id: '2020310000',
  is_group_manager: false
}

const db = {
  group: {
    findUnique: jest.fn().mockResolvedValue(group),
    findMany: jest.fn(),
    create: jest.fn().mockResolvedValue(group),
    update: jest.fn().mockResolvedValue(group),
    delete: jest.fn()
  },
  userGroup: {
    findUnique: jest.fn().mockResolvedValue(userGroup),
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([membership]),
    create: jest.fn().mockResolvedValue(userGroup),
    update: jest.fn().mockResolvedValue(userGroup),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn(),
    deleteMany: jest.fn()
  },
  user: {
    findUnique: jest.fn().mockResolvedValue({ id: userId })
  },
  problem: {
    update: jest.fn()
  },
  contest: {
    update: jest.fn()
  },
  workbook: {
    update: jest.fn()
  }
}

describe('GroupService', () => {
  let service: GroupService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get<GroupService>(GroupService)
  })

  //beforeAll(() => {})

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getUserGroupMembershipInfo', () => {
    const membership = {
      is_registered: userGroup.is_registered,
      is_group_manager: userGroup.is_group_manager
    }

    it('should return specified membership', async () => {
      db.userGroup.findFirst.mockResolvedValueOnce(membership)

      const getUserGroup = await service.getUserGroupMembershipInfo(
        userId,
        groupId
      )
      expect(getUserGroup).toEqual(membership)
    })
  })

  describe('getManagingGroupIds', () => {
    db.userGroup.findMany.mockResolvedValueOnce([{ group_id: groupId }])

    it('should return all managing group ids', async () => {
      const getIds = await service.getManagingGroupIds(userId)
      expect(getIds).toEqual([groupId])
    })
  })

  describe('createGroup', () => {
    it('should return newly created group', async () => {
      const encryptSpy = jest.spyOn(service, 'createCode')
      const createGroup = await service.createGroup(userId, requestGroupDto)
      expect(createGroup).toEqual(group)
      expect(encryptSpy).toBeCalledTimes(1)
    })
  })

  describe('getAdminGroups', () => {
    const adminGroup = {
      id: group.id,
      group_name: group.group_name,
      private: group.private,
      description: group.private,
      UserGroup: [userGroup]
    }

    it('should return all managing groups', async () => {
      db.group.findMany.mockResolvedValueOnce([adminGroup])

      const getGroups = await service.getAdminGroups(userId)
      expect(getGroups).toEqual([{ ...adminGroup, UserGroup: 1 }])
    })
  })

  describe('getAdminGroup', () => {
    const adminGroup = {
      id: group.id,
      group_name: group.group_name,
      private: group.private,
      invitation_code: group.invitation_code,
      description: group.private,
      create_time: group.create_time,
      update_time: group.update_time,
      UserGroup: [userGroup]
    }

    it('should return specified group', async () => {
      db.group.findUnique.mockResolvedValueOnce(adminGroup)

      const getGroup = await service.getAdminGroup(groupId)
      expect(getGroup).toEqual({
        ...adminGroup,
        UserGroup: 1,
        ManagerGroup: ['example']
      })
    })

    it('should throw error when the group does not exist', async () => {
      db.group.findUnique.mockRejectedValueOnce(
        new EntityNotExistException('group')
      )

      await expect(service.getAdminGroup(groupId)).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('updateGroup', () => {
    it('should return updated group', async () => {
      const updateGroup = await service.updateGroup(groupId, requestGroupDto)
      expect(updateGroup).toEqual(group)
    })

    it('should throw error when the group does not exist', async () => {
      db.group.findUnique.mockRejectedValueOnce(
        new EntityNotExistException('group')
      )

      await expect(
        service.updateGroup(groupId, requestGroupDto)
      ).rejects.toThrow(EntityNotExistException)
    })
  })

  describe('deleteGroup', () => {
    afterEach(() => {
      db.group.delete.mockClear()
      db.userGroup.deleteMany.mockClear()
      db.problem.update.mockClear()
      db.contest.update.mockClear()
      db.workbook.update.mockClear()
    })

    const relatedData = {
      Problem: [
        {
          id: 1
        }
      ],
      Contest: [
        {
          id: 1
        }
      ],
      Workbook: [
        {
          id: 1
        }
      ]
    }

    it('should successfully delete the group and move related data', async () => {
      db.group.findUnique.mockResolvedValueOnce(relatedData)

      await service.deleteGroup(groupId)
      expect(db.group.delete).toBeCalledTimes(1)
      expect(db.userGroup.deleteMany).toBeCalledTimes(1)
      expect(db.problem.update).toBeCalledTimes(1)
      expect(db.contest.update).toBeCalledTimes(1)
      expect(db.workbook.update).toBeCalledTimes(1)
    })

    it('should throw error when the group does not exist', async () => {
      db.group.findUnique.mockRejectedValueOnce(
        new EntityNotExistException('group')
      )

      await expect(service.deleteGroup(groupId)).rejects.toThrow(
        EntityNotExistException
      )
      expect(db.group.delete).toBeCalledTimes(0)
      expect(db.userGroup.deleteMany).toBeCalledTimes(0)
      expect(db.problem.update).toBeCalledTimes(0)
      expect(db.contest.update).toBeCalledTimes(0)
      expect(db.workbook.update).toBeCalledTimes(0)
    })
  })

  describe('createMembers', () => {
    it('should return newly created group', async () => {
      const createMembers = await service.createMembers(groupId, [
        createMemberDto
      ])
      expect(createMembers).toEqual([userGroup])
    })
  })

  describe('getAdminManagers', () => {
    it('should return managers of the group', async () => {
      const getUserGroups = await service.getAdminManagers(groupId)
      expect(getUserGroups).toEqual([membership])
    })
  })

  describe('getAdminMembers', () => {
    const memberMembership = {
      ...membership,
      is_group_manager: userGroup.is_group_manager
    }

    it('should return members of the group', async () => {
      db.userGroup.findMany.mockResolvedValueOnce([memberMembership])

      const getUserGroups = await service.getAdminMembers(groupId, 0)
      expect(getUserGroups).toEqual([memberMembership])
    })
  })

  describe('getAdminPendingMembers', () => {
    it('should return members of the group', async () => {
      const getUserGroups = await service.getAdminPendingMembers(groupId, 0)
      expect(getUserGroups).toEqual([membership])
    })
  })

  describe('getAdminPendingMembers', () => {
    it('should return pending members of the group', async () => {
      const getUserGroups = await service.getAdminPendingMembers(groupId, 0)
      expect(getUserGroups).toEqual([membership])
    })
  })

  describe('gradeMember', () => {
    afterEach(() => {
      db.userGroup.update.mockClear()
    })

    const memberUserGroup = {
      ...userGroup,
      is_group_manager: false
    }

    it('should successfully grade selected member', async () => {
      await service.gradeMember(userGroup.id, false)
      expect(db.userGroup.update).toBeCalledTimes(1)
    })

    it('should fail to upgrade manager', async () => {
      await expect(service.gradeMember(userGroup.id, true)).rejects.toThrow(
        ActionNotAllowedException
      )
      expect(db.userGroup.update).toBeCalledTimes(0)
    })

    it('should fail to downgrade member', async () => {
      db.userGroup.findUnique.mockResolvedValueOnce(memberUserGroup)

      await expect(
        service.gradeMember(memberUserGroup.id, false)
      ).rejects.toThrow(ActionNotAllowedException)
      expect(db.userGroup.update).toBeCalledTimes(0)
    })

    it('should throw error when the member does not exist', async () => {
      db.userGroup.findUnique.mockRejectedValueOnce(
        new EntityNotExistException('membership')
      )

      await expect(
        service.gradeMember(memberUserGroup.id, false)
      ).rejects.toThrow(EntityNotExistException)
      expect(db.userGroup.update).toBeCalledTimes(0)
    })
  })

  describe('registerMembers', () => {
    it('should successfully register selected members', async () => {
      const updateUserGroup = await service.registerMembers([userId])
      expect(updateUserGroup).toEqual({ count: 1 })
    })
  })

  describe('deleteMember', () => {
    afterEach(() => {
      db.userGroup.delete.mockClear()
    })

    it('should successfully delete the member', async () => {
      await service.deleteMember(userGroup.id)
      expect(db.userGroup.delete).toBeCalledTimes(1)
    })

    it('should throw error when the member does not exist', async () => {
      db.userGroup.findFirst.mockRejectedValueOnce(
        new EntityNotExistException('membership')
      )

      await expect(service.deleteMember(userGroup.id)).rejects.toThrow(
        EntityNotExistException
      )
      expect(db.userGroup.delete).toBeCalledTimes(0)
    })
  })
})
