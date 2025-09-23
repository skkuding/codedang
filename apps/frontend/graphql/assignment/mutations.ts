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
    $assignmentProblemInput: [AssignmentProblemInput!]!
  ) {
    importProblemsToAssignment(
      groupId: $groupId,
      assignmentId: $assignmentId,
      assignmentProblemInput: $assignmentProblemInput
    ) {
      assignmentId
      problemId
      score
      solutionReleaseTime
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

const UPDATE_ASSIGNMENT_PROBLEM_RECORD = gql(`
  mutation UpdateAssignmentProblemRecord($groupId: Int!, $input: UpdateAssignmentProblemRecordInput!) {
    updateAssignmentProblemRecord(groupId: $groupId, input: $input) {
      assignmentId
      userId
      problemId
      isSubmitted
      isAccepted
      finalScore
      comment
    }
  }
`)

const AUTO_FINALIZE_SCORE = gql(`
  mutation AutoFinalizeScore($groupId: Int!, $assignmentId: Int!) {
    autoFinalizeScore(groupId: $groupId, assignmentId: $assignmentId)
  }
`)

export {
  CREATE_ASSIGNMENT,
  DELETE_ASSIGNMENT,
  DUPLICATE_ASSIGNMENT,
  IMPORT_PROBLEMS_TO_ASSIGNMENT,
  REMOVE_PROBLEMS_FROM_ASSIGNMENT,
  UPDATE_ASSIGNMENT,
  UPDATE_ASSIGNMENT_PROBLEM_RECORD,
  UPDATE_ASSIGNMENT_VISIBLE,
  AUTO_FINALIZE_SCORE
}
