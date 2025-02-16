export interface UserGroupData {
  userId: number
  groupId: number
  isGroupLeader: boolean
}

export enum GroupType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Course = 'Course',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Study = 'Study'
}
