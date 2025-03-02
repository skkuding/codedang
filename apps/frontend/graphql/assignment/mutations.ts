import { gql } from '@generated'

const CREATE_ASSIGNMENT = gql(`
  mutation CreateAssignment($groupId: Int!, $input: CreateAssignmentInput!) {
    createAssignment(groupId: $groupId, input: $input) {
      id
      isVisible
      isRankVisible
      enableCopyPaste
      isJudgeResultVisible
      description
      endTime
      startTime
      title
      week
    }
  }
`)

const UPDATE_ASSIGNMENT = gql(`
  mutation UpdateAssignment($groupId: Int!, $input: UpdateAssignmentInput!) {
    updateAssignment(groupId: $groupId, input: $input) {
      id
      isRankVisible
      isVisible
      enableCopyPaste
      isJudgeResultVisible
      description
      endTime
      startTime
      title
      week
    }
  }
`)

const UPDATE_ASSIGNMENT_VISIBLE = gql(`
  mutation UpdateAssignmentVisible($groupId: Int!, $input: UpdateAssignmentInput!) {
    updateAssignment(groupId: $groupId, input: $input) {
      id
      isVisible
      isRankVisible
    }
  }
`)

const DELETE_ASSIGNMENT = gql(`
  mutation DeleteAssignment($groupId: Int!, $assignmentId: Int!) {
    deleteAssignment(groupId: $groupId, assignmentId: $assignmentId) {
      id
    }
  }
`)

const IMPORT_PROBLEMS_TO_ASSIGNMENT = gql(`
  mutation ImportProblemsToAssignment(
    $groupId: Int!,
    $assignmentId: Int!,
    $problemIdsWithScore: [AssignmentProblemScoreInput!]!
  ) {
    importProblemsToAssignment(
      groupId: $groupId,
      assignmentId: $assignmentId,
      problemIdsWithScore: $problemIdsWithScore
    ) {
      assignmentId
      problemId
      score
    }
  }
`)

const REMOVE_PROBLEMS_FROM_ASSIGNMENT = gql(`
  mutation RemoveProblemsFromAssignment(
    $groupId: Int!,
    $assignmentId: Int!,
    $problemIds: [Int!]!
  ) {
    removeProblemsFromAssignment(
      groupId: $groupId,
      assignmentId: $assignmentId,
      problemIds: $problemIds
    ) {
      assignmentId
      problemId
    }
  }
`)

const DUPLICATE_ASSIGNMENT = gql(`
  mutation DuplicateAssignment($groupId: Int!, $assignmentId: Int!) {
    duplicateAssignment(groupId: $groupId, assignmentId: $assignmentId) {
      assignment {
        id
        isRankVisible
        isVisible
        description
        endTime
        startTime
        title
      }
      problems {
        problemId
        assignmentId
        order

      }
      records {
        id
        userId
        score
      }
    }
  }
`)

export {
  CREATE_ASSIGNMENT,
  UPDATE_ASSIGNMENT,
  UPDATE_ASSIGNMENT_VISIBLE,
  DELETE_ASSIGNMENT,
  IMPORT_PROBLEMS_TO_ASSIGNMENT,
  REMOVE_PROBLEMS_FROM_ASSIGNMENT,
  DUPLICATE_ASSIGNMENT
}
