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
export { CREATE_COURSE, DELETE_COURSE }
