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
export { CREATE_COURSE }
