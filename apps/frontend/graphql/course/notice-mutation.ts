import { gql } from '@generated'

export const CREATE_COURSE_NOTICE = gql(`
  mutation CreateCourseNotice($input: CreateCourseNoticeInput!) {
    createCourseNotice(input: $input) {
      id
      title
      content
      isFixed
      isPublic
      createTime
      updateTime
    }
  }
`)

export const UPDATE_COURSE_NOTICE = gql(`
  mutation UpdateCourseNotice(
    $groupId: Int!
    $courseNoticeId: Int!
    $input: UpdateCourseNoticeInput!
  ) {
    updateCourseNotice(
      groupId: $groupId
      courseNoticeId: $courseNoticeId
      input: $input
    ) {
      id
      title
      content
      isFixed
      isPublic
      updateTime
    }
  }
`)

export const DELETE_COURSE_NOTICE = gql(`
  mutation DeleteCourseNotice($groupId: Int!, $courseNoticeId: Int!) {
    deleteCourseNotice(groupId: $groupId, courseNoticeId: $courseNoticeId) {
      id
    }
  }
`)

export const CLONE_COURSE_NOTICES = gql(`
  mutation CloneCourseNotices(
    $groupId: Int!
    $courseNoticeIds: [Int!]!
    $cloneToId: Int!
  ) {
    cloneCourseNotices(
      groupId: $groupId
      courseNoticeIds: $courseNoticeIds
      cloneToId: $cloneToId
    ) {
      id
      title
    }
  }
`)
