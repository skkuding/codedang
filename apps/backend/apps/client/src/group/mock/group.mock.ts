import { type Group, Role, type User, type UserGroup } from '@prisma/client'

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
    groupName: 'mock public group',
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
    groupName: 'mock public group 2',
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
    groupName: 'mock public group 2',
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z')
  }
]

const users: User[] = [
  {
    id: 1,
    role: Role.Manager,
    password: '1234',
    username: 'manager',
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    email: 'manager@skkuding.dev',
    lastLogin: new Date('2023-02-22T10:00:00.000Z'),
    studentID: '2024139898',
    major: 'chemistry'
  },
  {
    id: 2,
    role: Role.User,
    password: '1234',
    username: 'user01',
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    email: 'user01@skkuding.dev',
    lastLogin: new Date('2023-02-22T10:00:00.000Z'),
    studentID: '2024123456',
    major: 'chemistry'
  },
  {
    id: 3,
    role: Role.User,
    password: '1234',
    username: 'user02',
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    email: 'user02@skkuding.dev',
    lastLogin: new Date('2023-02-22T10:00:00.000Z'),
    studentID: '2024654321',
    major: 'chemistry'
  },
  {
    id: 4,
    role: Role.User,
    password: '1234',
    username: 'user03',
    createTime: new Date('2023-02-22T00:00:00.000Z'),
    updateTime: new Date('2023-02-22T10:00:00.000Z'),
    email: 'user03@skkuding.dev',
    lastLogin: new Date('2023-02-22T10:00:00.000Z'),
    studentID: '2024312123',
    major: 'chemistry'
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

export const userGroupsForJoinedGroups = [
  {
    ...userGroups[0],
    group: {
      ...groups[0],
      createdBy: users[0],
      userGroup: userGroups.slice(0, 2)
    }
  },
  {
    ...userGroups[1],
    group: {
      ...groups[0],
      createdBy: users[0],
      userGroup: userGroups.slice(0, 2)
    }
  },
  {
    ...userGroups[2],
    group: {
      ...groups[1],
      createdBy: users[0],
      userGroup: userGroups.slice(2)
    }
  },
  {
    ...userGroups[3],
    group: {
      ...groups[1],
      createdBy: users[0],
      userGroup: userGroups.slice(2)
    }
  }
]

export const publicGroupDatas = [
  {
    id: 1,
    groupName: 'mock public group',
    description: 'mock public group with no approval',
    memberNum: 2
  },
  {
    id: 2,
    groupName: 'mock public group 2',
    description: 'mock public group with approval',
    memberNum: 2
  }
]

export const mockGroupData = {
  id: 2,
  groupName: 'mock public group 2',
  description: 'mock public group with approval',
  config: {
    showOnList: true,
    allowJoinFromSearch: true,
    allowJoinWithURL: false,
    requireApprovalBeforeJoin: false
  },
  createdBy: {
    username: 'manager'
  },
  userGroup: [userGroups[2], userGroups[3]]
}
