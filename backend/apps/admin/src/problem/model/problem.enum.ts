import { registerEnumType } from '@nestjs/graphql'

/* eslint-disable @typescript-eslint/naming-convention */

export enum LAction {
  Delete = 'Delete',
  Create = 'Create'
}

registerEnumType(LAction, { name: 'LAction' })
