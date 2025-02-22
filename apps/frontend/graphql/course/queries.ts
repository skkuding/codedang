import { gql } from '@generated'

const GET_COURSES_USER_LEAD = gql(`
  query GetCoursesUserLead {
    getCoursesUserLead {
      id
      groupName
      groupType
      courseInfo {
        courseNum
        classNum
        professor
        semester
      }
    }
  }
`)

export { GET_COURSES_USER_LEAD }
