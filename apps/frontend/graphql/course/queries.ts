import { gql } from '@generated'

const GET_COURSES = gql(`
    query GetCourses ($cursor: Int, $take: Int!) {
    getCourses(cursor: $cursor, take: $take) {
      id
      groupName
      groupType
      courseInfo{
        courseNum
        classNum
        professor
        semester
      }
      config
    }
  }
`)

export { GET_COURSES }
