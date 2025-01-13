import { gql } from '@generated'

const GET_NOTICE = gql(`
  query GetNotice($groupId: Int!, $noticeId: Int!) {
    getNotice(groupId: $groupId, noticeId: $noticeId) {
      title
      content
    }
  }
`)

export { GET_NOTICE }
