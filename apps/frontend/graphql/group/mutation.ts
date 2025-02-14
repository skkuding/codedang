import { gql } from '@generated'

const DELETE_GROUP = gql(`
    mutation DeleteGroup($groupId: Int!) {
      deleteGroup(groupId: $groupId) {
      count
    }
  }
`)

export { DELETE_GROUP }
