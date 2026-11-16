import {
  GET_ASSIGNMENT,
  GET_ASSIGNMENTS,
  GET_ASSIGNMENT_SCORE_SUMMARIES
} from '@/graphql/assignment/queries'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable
} from '@apollo/client'
import { Level, type UpdateAssignmentInput } from '@generated/graphql'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import { useState } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { afterEach, expect, it, vi } from 'vitest'
import type { AssignmentProblem } from '../_libs/type'
import { CreateAssignmentForm } from './CreateAssignmentForm'
import { EditAssignmentForm } from './EditAssignmentForm'

const navigation = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => navigation }))
vi.mock('@/app/admin/_components/ConfirmNavigation', () => ({
  useConfirmNavigationContext: () => ({ setShouldSkipWarning: vi.fn() })
}))
vi.mock('@/components/AlertModal', () => ({ AlertModal: () => null }))
vi.mock('@/components/ModalSection', () => ({ ModalSection: () => null }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const variables = { groupId: 7, assignmentId: 12 }
const oldDue = '2099-01-02T00:00:00.000Z'
const newDue = '2099-01-03T00:00:00.000Z'
const assignment = {
  __typename: 'AssignmentWithParticipants' as const,
  id: '12',
  title: 'Course content',
  description: '',
  week: 1,
  participants: 0,
  startTime: '2099-01-01T00:00:00.000Z',
  endTime: '2099-01-04T00:00:00.000Z',
  dueTime: oldDue,
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  isFinalScoreVisible: false,
  autoFinalizeScore: false,
  isVisible: true,
  isRankVisible: true
}
const problems = [1, 2].map((id) => ({
  __typename: 'AssignmentProblem' as const,
  assignmentId: 12,
  problemId: id,
  order: id - 1,
  score: 10,
  createTime: oldDue,
  updateTime: oldDue,
  solutionReleaseTime: oldDue,
  problem: {
    __typename: 'ProblemWithIsVisible' as const,
    id: String(id),
    title: `Problem ${id}`,
    description: '',
    isVisible: true,
    difficulty: Level.Level1,
    solution: []
  }
}))
const updatedProblems = problems.map((problem) => ({
  ...problem,
  order: 1 - problem.order,
  score: 20,
  solutionReleaseTime: newDue
}))
const draftProblems: AssignmentProblem[] = updatedProblems.map((problem) => ({
  id: problem.problemId,
  title: problem.problem.title,
  difficulty: problem.problem.difficulty,
  order: problem.order,
  score: problem.score,
  solutionReleaseTime: new Date(newDue),
  solution: []
}))

function setup(isExercise: boolean) {
  const reads: string[] = []
  const writes: string[] = []
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          const name = operation.operationName
          const saved = writes.includes('UpdateAssignmentProblemsOrder')
          const latest = { ...assignment, dueTime: newDue }
          const mutationFields = Object.fromEntries(
            Object.entries(latest).filter(
              ([field]) =>
                ![
                  'dueTime',
                  'participants',
                  'isFinalScoreVisible',
                  'autoFinalizeScore'
                ].includes(field)
            )
          )
          const result = { ...mutationFields, __typename: 'Assignment' }
          const responses: Record<string, Record<string, unknown>> = {
            GetAssignments: { getAssignments: saved ? [latest] : [] },
            GetAssignment: { getAssignment: saved ? latest : assignment },
            GetAssignmentProblems: {
              getAssignmentProblems: saved ? updatedProblems : problems
            },
            CreateAssignment: { createAssignment: result },
            UpdateAssignment: { updateAssignment: result },
            ImportProblemsToAssignment: {
              importProblemsToAssignment: updatedProblems
            },
            UpdateAssignmentProblemsOrder: {
              updateAssignmentProblemsOrder: updatedProblems
            },
            UpdateAssignmentProblems: {
              updateAssignmentProblems: updatedProblems
            }
          }
          if (name.startsWith('Get')) {
            reads.push(name)
          } else {
            writes.push(name)
          }
          if (name === 'UpdateAssignment') {
            expect(operation.variables.input.dueTime).toEqual(new Date(newDue))
          }
          const data = responses[name]
          if (!data) {
            observer.error(new Error(`Unexpected operation: ${name}`))
            return
          }
          observer.next({ data })
          observer.complete()
        })
    )
  })
  const listVariables = { groupId: 7, take: 300, isExercise }
  client.writeQuery({
    query: GET_ASSIGNMENTS,
    variables: listVariables,
    data: { getAssignments: [] }
  })
  client.writeQuery({
    query: GET_ASSIGNMENT,
    variables,
    data: { getAssignment: assignment }
  })
  client.writeQuery({
    query: GET_ASSIGNMENT_PROBLEMS,
    variables,
    data: { getAssignmentProblems: problems }
  })
  client.writeQuery({
    query: GET_COURSES_USER_LEAD,
    data: { getCoursesUserLead: [] }
  })
  client.writeQuery({
    query: GET_ASSIGNMENT_SCORE_SUMMARIES,
    variables: { ...variables, take: 300 },
    data: { getAssignmentScoreSummaries: [] }
  })
  return { client, reads, writes, listVariables }
}

function Fields({ prepare }: { prepare?: () => void }) {
  const methods = useFormContext<UpdateAssignmentInput>()
  return (
    <>
      <button
        type="button"
        onClick={() => {
          methods.setValue('title', assignment.title)
          methods.setValue('week', 1)
          methods.setValue('startTime', new Date(assignment.startTime))
          methods.setValue('dueTime', new Date(newDue))
          methods.setValue('endTime', new Date(assignment.endTime))
          prepare?.()
        }}
      >
        Prepare
      </button>
      <button type="submit">Save</button>
    </>
  )
}

function ExerciseEditor() {
  const methods = useForm<UpdateAssignmentInput>()
  const [selected, setSelected] = useState<AssignmentProblem[]>([])
  const [loading, setLoading] = useState(true)
  return (
    <>
      <p>{loading ? 'Loading' : 'Ready'}</p>
      <EditAssignmentForm
        courseId={7}
        assignmentId={12}
        isExercise
        methods={methods}
        problems={selected}
        setProblems={setSelected}
        setIsLoading={setLoading}
      >
        <Fields
          prepare={() =>
            setSelected(draftProblems.map((problem) => ({ ...problem })))
          }
        />
      </EditAssignmentForm>
    </>
  )
}

it('reloads a previously cached Course assignment list after creation', async () => {
  const { client, listVariables, writes, reads } = setup(false)
  const view = render(
    <ApolloProvider client={client}>
      <CreateAssignmentForm
        groupId="7"
        problems={draftProblems.map((problem) => ({ ...problem }))}
        setIsCreating={vi.fn()}
      >
        <Fields />
      </CreateAssignmentForm>
    </ApolloProvider>
  )
  fireEvent.click(screen.getByRole('button', { name: 'Prepare' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() =>
    expect(navigation.push).toHaveBeenCalledWith('/admin/course/7/assignment')
  )
  view.unmount()
  const { data } = await client.query({
    query: GET_ASSIGNMENTS,
    variables: listVariables
  })
  expect(writes).toEqual([
    'CreateAssignment',
    'ImportProblemsToAssignment',
    'UpdateAssignmentProblemsOrder'
  ])
  expect(data.getAssignments.map(({ id }) => id)).toEqual(['12'])
  expect(reads).toContain('GetAssignments')
})

it('reloads edited Exercise due time and problem settings with the same Apollo client', async () => {
  const { client, writes } = setup(true)
  const view = render(
    <ApolloProvider client={client}>
      <ExerciseEditor />
    </ApolloProvider>
  )
  await screen.findByText('Ready')
  fireEvent.click(screen.getByRole('button', { name: 'Prepare' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() =>
    expect(navigation.push).toHaveBeenCalledWith('/admin/course/7/exercise')
  )
  view.unmount()
  const [detail, selected] = await Promise.all([
    client.query({ query: GET_ASSIGNMENT, variables }),
    client.query({ query: GET_ASSIGNMENT_PROBLEMS, variables })
  ])
  expect(writes).toEqual([
    'UpdateAssignment',
    'UpdateAssignmentProblemsOrder',
    'UpdateAssignmentProblems'
  ])
  expect(client.readQuery({ query: GET_COURSES_USER_LEAD })).toEqual({
    getCoursesUserLead: []
  })
  expect(
    client.readQuery({
      query: GET_ASSIGNMENT_SCORE_SUMMARIES,
      variables: { ...variables, take: 300 }
    })
  ).toBeNull()
  expect(detail.data.getAssignment.dueTime).toBe(newDue)
  expect(
    selected.data.getAssignmentProblems.map(
      ({ problemId, order, score, solutionReleaseTime }) => ({
        problemId,
        order,
        score,
        solutionReleaseTime
      })
    )
  ).toEqual([
    { problemId: 1, order: 1, score: 20, solutionReleaseTime: newDue },
    { problemId: 2, order: 0, score: 20, solutionReleaseTime: newDue }
  ])
})
