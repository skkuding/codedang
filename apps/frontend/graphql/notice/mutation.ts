import { gql } from '@generated'

const CREATE_NOTICE = gql(`
  mutation CreateNotice($groupId: Int!, $noticeInput: CreateNoticeInput!) {
    createNotice(groupId: $groupId, input: $noticeInput) {
      id
    }
  }
`)

export { CREATE_NOTICE }
