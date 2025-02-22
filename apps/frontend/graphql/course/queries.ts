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

const GET_COURSE = gql(`
  query GetCourse ($groupId: Int!){
      getCourse(groupId: $groupId) {
      id
      groupName
      groupType
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
      invitation
      memberNum
    }
  }
`)

export { GET_COURSES_USER_LEAD, GET_COURSE }
