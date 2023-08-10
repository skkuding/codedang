import { registerEnumType } from '@nestjs/graphql'

/* eslint-disable @typescript-eslint/naming-convention */
export enum LLanguage {
  C = 'C',
  Cpp = 'Cpp',
  Java = 'Java',
  Python3 = 'Python3'
}

export enum LLevel {
  Level1 = 'Level1',
  Level2 = 'Level2',
  Level3 = 'Level3'
}

export enum LAction {
  Delete = 'Delete',
  Create = 'Create'
}

registerEnumType(LLanguage, { name: 'LLanguage' })
registerEnumType(LLevel, { name: 'LLevel' })
registerEnumType(LAction, { name: 'LAction' })
