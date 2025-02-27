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
  mutation duplicateCourse($groupId: Int!){
    duplicateCourse(groupId: $groupId) {
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

export {
  CREATE_COURSE,
  DELETE_COURSE,
  UPDATE_COURSE,
  DUPLICATE_COURSE,
  CREATE_WHITE_LIST
}
