import { gql } from '@apollo/client'

const GET_NOTICE = gql(`
  query GetNotice($groupId: Int!, $noticeId: Int!) {
    getNotice(groupId: $groupId, noticeId: $noticeId) {
      title
      content
    }
  }
`)

export { GET_NOTICE }
