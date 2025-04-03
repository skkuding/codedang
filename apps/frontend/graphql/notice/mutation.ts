import { gql } from '@generated'

const CREATE_NOTICE = gql(`
  mutation CreateNotice($noticeInput: CreateNoticeInput!) {
    createNotice(input: $noticeInput) {
      id
    }
  }
`)

export { CREATE_NOTICE }
