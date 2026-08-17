import { gql } from '@generated'

const DELETE_COURSE_QNA = gql(`
  mutation DeleteCourseQna($groupId: Int!, $order: Int!) {
    deleteCourseQnA(groupId: $groupId, order: $order) {
      id
    }
  }
`)

const CREATE_COURSE_QNA_COMMENT = gql(`
  mutation CreateCourseQnaComment($groupId: Int!, $qnaOrder: Int!, $content: String!) {
    createCourseQnAComment(groupId: $groupId, order: $qnaOrder, content: $content) {
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
`)

const DELETE_COURSE_QNA_COMMENT = gql(`
  mutation DeleteCourseQnaComment($groupId: Int!, $qnaOrder: Int!, $commentOrder: Int!) {
    deleteCourseQnAComment(groupId: $groupId, qnaOrder: $qnaOrder, commentOrder: $commentOrder) {
      id
    }
  }
`)

export {
  DELETE_COURSE_QNA,
  CREATE_COURSE_QNA_COMMENT,
  DELETE_COURSE_QNA_COMMENT
}
