import { gql } from '@generated'

const CREATE_NOTICE = gql(`
  mutation CreateNotice($noticeInput: CreateNoticeInput!) {
    createNotice(input: $noticeInput) {
      id
    }
  }
`)

const DELETE_NOTICE = gql(`
  mutation DeleteNotice($noticeId: Int!) {
    deleteNotice(noticeId: $noticeId) {
      id
    }
  }
`)

export { CREATE_NOTICE, DELETE_NOTICE }
