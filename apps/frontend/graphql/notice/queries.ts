import { gql } from '@generated'

const GET_NOTICE = gql(`
  query GetNotice($noticeId: Int!) {
    getNotice(noticeId: $noticeId) {
      title
      content
    }
  }
`)

const GET_NOTICES = gql(`
  query GetNotices($cursor: Int, $take: Int!) {
    getNotices(cursor: $cursor, take: $take) {
      id
      createdBy {
        username
      }
      title
      isVisible
      isFixed
      createTime
      updateTime
    }
  }
`)

export { GET_NOTICE, GET_NOTICES }
