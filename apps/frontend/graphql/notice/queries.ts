import { gql } from '@generated'

const GET_NOTICE = gql(`
  query GetNotice($noticeId: Int!) {
    getNotice(noticeId: $noticeId) {
      title
      content
    }
  }
`)

export { GET_NOTICE }
