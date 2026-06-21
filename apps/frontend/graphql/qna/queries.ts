import { gql } from '@generated'

const GET_COURSE_QNAS = gql(`
  query GetCourseQnas($groupId: Int!){
    getCourseQnAs(groupId: $groupId) {
      id
      order
      title
      content
      problemId
      category
      isResolved
      isPrivate
      createTime
      groupId
      createdBy {
        username
      }
    }
  }
`)

const GET_COURSE_QNA = gql(`
  query GetCourseQna($groupId: Int!, $order: Int!){
    getCourseQnA(groupId: $groupId, order: $order) {
      id
      order
      title
      content
      problemId
      category
      isResolved
      isPrivate
      createTime
      groupId
      createdBy {
        username
      }
      comments {
        id
        order
        content
        isCourseStaff
        createTime
        createdBy {
          username
        }
      }
    }
  }
`)

export { GET_COURSE_QNAS, GET_COURSE_QNA }
