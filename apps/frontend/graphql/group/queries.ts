import { gql } from '@generated'

const GET_GROUP = gql(`
  query GetGroup($groupId: Int!) {
    getGroup(groupId: $groupId){
  	id
    groupName
    description
  }
}
`)

const GET_GROUPS = gql(`
  query GetGroups($cursor: Int!, $take: Int!) {
  getGroups(cursor: $cursor, take: $take){
  	id
    groupName
    description
    config
  }
}
`)

export { GET_GROUP, GET_GROUPS }
