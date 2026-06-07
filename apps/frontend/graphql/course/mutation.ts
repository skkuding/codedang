import { gql } from '@generated'

const CREATE_COURSE = gql(`
  mutation CreateCourse( $input: CourseInput!) {
      createCourse(input: $input) {
      id
      groupName
      groupType
      config
      courseInfo {
        courseNum
        classNum
        professor
        semester
        week
        email
        website
        office
        phoneNum
      }
    }
  }
`)

const DELETE_COURSE = gql(`
  mutation DeleteCourse($groupId: Int!) {
      deleteCourse(groupId: $groupId) {
      id
      groupName
      courseInfo {
        courseNum
        classNum
        professor
        semester
      }
    }
  }
`)

const UPDATE_COURSE = gql(`
  mutation UpdateCourse($groupId: Int!, $input: CourseInput!){
    updateCourse(groupId: $groupId, input: $input) {
      id
      groupName
      groupType
      config
      courseInfo {
        courseNum
        classNum
        professor
        semester
        email
        website
        office
        phoneNum
      }
    }
  }
`)

const DUPLICATE_COURSE = gql(`
  mutation duplicateCourse($groupId: Int!, $input: DuplicateCourseInput!){
    duplicateCourse(groupId: $groupId, input: $input) {
      duplicatedCourse {
        id
        groupName
        groupType
        config
        courseInfo {
          courseNum
          classNum
          professor
          semester
          week
          email
          website
          office
          phoneNum
        }
      }
      originAssignments
      copiedAssignments
    }
  }
`)

const CREATE_WHITE_LIST = gql(`
  mutation createWhitelist($groupId: Int!, $studentIds: [String!]!){
    createWhitelist(groupId: $groupId, studentIds: $studentIds)
  }
`)

const DELETE_WHITE_LIST = gql(`
  mutation deleteWhitelist($groupId: Int!){
    deleteWhitelist(groupId: $groupId)
  }
`)

const CREATE_COURSE_NOTICE = gql(`
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

const UPDATE_COURSE_NOTICE = gql(`
  mutation UpdateCourseNotice(
    $courseNoticeId: Int!
    $input: UpdateCourseNoticeInput!
  ) {
    updateCourseNotice(courseNoticeId: $courseNoticeId, input: $input) {
      id
      title
      content
      isFixed
      isPublic
      updateTime
    }
  }
`)

const DELETE_COURSE_NOTICE = gql(`
  mutation DeleteCourseNotice($courseNoticeId: Int!) {
    deleteCourseNotice(courseNoticeId: $courseNoticeId) {
      id
    }
  }
`)

const CLONE_COURSE_NOTICES = gql(`
  mutation CloneCourseNotices(
    $courseNoticeIds: [Int!]!
    $cloneToId: Int!
  ) {
    cloneCourseNotices(
      courseNoticeIds: $courseNoticeIds
      cloneToId: $cloneToId
    ) {
      id
      title
    }
  }
`)

export {
  CREATE_COURSE,
  DELETE_COURSE,
  UPDATE_COURSE,
  DUPLICATE_COURSE,
  CREATE_WHITE_LIST,
  DELETE_WHITE_LIST,
  CREATE_COURSE_NOTICE,
  UPDATE_COURSE_NOTICE,
  DELETE_COURSE_NOTICE,
  CLONE_COURSE_NOTICES
}
