import { Group, Role, User, UserGroup } from '@prisma/client'

export const groups: Group[] = [
  {
    id: 1,
    config: {
      showOnList: true,
      allowJoinFromSearch: true,
      allowJoinWithURL: false,
      requireApprovalBeforeJoin: false
    },
    description: 'mock public group with no approval',
    createdById: 1,
    groupName: 'mock public group',
    isDeleted: false,
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T:00:00.000Z')
  },
  {
    id: 2,
    config: {
      showOnList: true,
      allowJoinFromSearch: true,
      allowJoinWithURL: false,
      requireApprovalBeforeJoin: true
    },
    description: 'mock public group with approval',
    createdById: 1,
    groupName: 'mock public group 2',
    isDeleted: false,
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z')
  },
  {
    id: 3,
    config: {
      showOnList: false,
      allowJoinFromSearch: false,
      allowJoinWithURL: true,
      requireApprovalBeforeJoin: true
    },
    description: 'mock public group with approval',
    createdById: 1,
    groupName: 'mock public group 2',
    isDeleted: false,
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z')
  }
]

export const users: User[] = [
  {
    id: 1,
    role: Role.Manager,
    password: '1234',
    username: 'manager',
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    email: 'manager@skkuding.dev',
    lastLogin: new Date('2023-02-22T10:00:00.000Z')
  },
  {
    id: 2,
    role: Role.User,
    password: '1234',
    username: 'user01',
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    email: 'user01@skkuding.dev',
    lastLogin: new Date('2023-02-22T10:00:00.000Z')
  },
  {
    id: 3,
    role: Role.User,
    password: '1234',
    username: 'user02',
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    email: 'user02@skkuding.dev',
    lastLogin: new Date('2023-02-22T10:00:00.000Z')
  },
  {
    id: 4,
    role: Role.User,
    password: '1234',
    username: 'user03',
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    email: 'user03@skkuding.dev',
    lastLogin: new Date('2023-02-22T10:00:00.000Z')
  }
]

export const userGroups: UserGroup[] = [
  {
    groupId: 1,
    userId: 1,
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    isGroupLeader: true
  },
  {
    groupId: 1,
    userId: 2,
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    isGroupLeader: false
  },
  {
    groupId: 2,
    userId: 1,
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    isGroupLeader: true
  },
  {
    groupId: 2,
    userId: 2,
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    isGroupLeader: false
  }
]
